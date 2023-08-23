import * as React from "react";
import {BugReportModule} from "../modules/BugReportModule";
import {generateHex} from "@intuitionrobotics/ts-common/utils/random-tools";
import {Platform_Jira, Platform_Slack} from "../../shared/api";
import {Dialog_Builder, DialogModule} from "@intuitionrobotics/thunderstorm/app-frontend/modules/dialog/DialogModule";
import {
    DialogButton_Cancel,
    DialogButton_Submit
} from "@intuitionrobotics/thunderstorm/app-frontend/modules/dialog/Dialog";
import {ToastModule} from "@intuitionrobotics/thunderstorm/app-frontend/modules/toaster/ToasterModule";
import {TS_Input} from "@intuitionrobotics/thunderstorm/app-frontend/components/TS_Input";
import {TS_TextArea} from "@intuitionrobotics/thunderstorm/app-frontend/components/TS_TextArea";

type Props = {
    component?: React.ReactNode
}
const style: React.CSSProperties = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    width: "50px",
    height: "50px",
    bottom: "30px",
    right: "10px",
    backgroundColor: "#5b7bd6",
    color: "white",
    borderRadius: "50%",
    borderColor: 'transparent'
};
type State = {
    error?: Error,
    errorInfo?: React.ErrorInfo
    description?: string
    subject?: string
}

export class BugReport
    extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {}
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        BugReportModule.sendBugReport("Automatic submission", "these logs were triggered by a UI failure", [Platform_Slack]);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    showAppConfirmationDialogExample = () => {
        const title = "Bug Report";

        const onSubmit = () => {
            if (!this.state.subject)
                return ToastModule.toastError('you must first add a subject');
            if (!this.state.description)
                return ToastModule.toastError('you must first add a description')
            BugReportModule.sendBugReport(this.state.subject, this.state.description || '', [Platform_Jira]);
            this.setState({subject: undefined, description: undefined});
            DialogModule.close();
        };

        const content =
            <div className={'ll_v_c'}>
                <div style={{
                    border: `1px solid darkslategray`,
                    marginBottom: "5px",
                    width: "91%",
                    margin: "8px"
                }}>
                    <TS_Input
                        id={"bug-report-subject"}
                        type={"text"}
                        value={this.state.subject || ''}
                        placeholder={"type bug name here"}
                        name={generateHex(8)}
                        onChange={(subject: string) => this.setState({subject})}
                    />
                </div>
                <TS_TextArea
                    id={"bug-report-description"}
                    type="text"
                    style={{height: "110px", margin: "8px", width: "100%", outline: "none"}}
                    value={this.state.description || ''}
                    placeholder={"type bug description here"}
                    onChange={(description: string) => this.setState({description})}/>
            </div>;


        new Dialog_Builder(content)
            .setTitle(title)
            .addButton(DialogButton_Cancel(() => {
                this.setState({description: undefined, subject: undefined})
                DialogModule.close();
            }))
            .addButton(DialogButton_Submit(() => onSubmit(), 'Submit'))
            .setOverlayColor("rgba(102, 255, 255, 0.4)")
            .show();
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <div>
                    <h2>Something went wrong.</h2>
                    <details style={{whiteSpace: 'pre-wrap'}}>
                        {this.state.error && this.state.error.toString()}
                        <br/>
                        {this.state.errorInfo.componentStack}
                    </details>
                    <button style={style} onClick={() => window.location.reload()}>reload!</button>
                </div>
            );
        }

        return (
            <>
                {this.props.children}
                <div
                    onClick={this.showAppConfirmationDialogExample}>
                    {this.props.component ||
                        <button style={style}>+</button>}
                </div>
            </>
        );
    }
};
