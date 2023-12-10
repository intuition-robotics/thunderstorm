import * as React from 'react';
import {GenericSelect} from "../GenericSelect";
import {BrowserHistoryModule} from "../../modules/HistoryModule";

const PLAYGROUND = "playground"

export type PlaygroundProps = {
    selectStyle: any
    iconClose: React.ReactNode
    iconOpen: React.ReactNode
    screens: PlaygroundScreen[]
}

type State = {
    selectedScreen?: PlaygroundScreen;
}

export type PlaygroundScreen<T = any> = {
    name: string
    renderer: React.ComponentType<T>
    data?: T[]
}

export class Playground
    extends React.Component<PlaygroundProps, State> {

    constructor(props: PlaygroundProps) {
        super(props);
        const queryParam = BrowserHistoryModule.getQueryParams()[PLAYGROUND];
        const screen = this.props.screens.find(s => s.name === queryParam);
        this.state = {selectedScreen: screen}
    }

    render() {
        return <div className={'match_height match_width'}>
            <div className={'match_height match_width'} style={{alignSelf: "start", padding: "20px"}}>
                <GenericSelect<PlaygroundScreen>
                    iconClose={this.props.iconClose}
                    iconOpen={this.props.iconOpen}
                    selectedOption={this.state.selectedScreen}
                    options={this.props.screens}
                    onChange={(screen: PlaygroundScreen) => {
                        this.setState({selectedScreen: screen})
                        BrowserHistoryModule.addQueryParam(PLAYGROUND, screen.name)
                    }}
                    styles={this.props.selectStyle}
                    presentation={(screen) => screen.name}
                />
            </div>
            <div style={{borderStyle: "double", display: "inline-block", padding: "12px", margin: "12px"}}>{this.renderPlayground()}</div>
        </div>
    }

    private renderPlayground() {
        if (!this.state.selectedScreen)
            return <div>Select a playground</div>

        const data = this.state.selectedScreen.data;
        if (!data || data.length === 0)
            return <this.state.selectedScreen.renderer/>

        if (data.length === 1)
            return <this.state.selectedScreen.renderer {...data[0]}/>

        return <this.state.selectedScreen.renderer {...data} />
    }
}
