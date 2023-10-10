import * as React from 'react';
import {XhrHttpModule} from "@intuitionrobotics/thunderstorm/app-frontend/modules/http/XhrHttpModule";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {BaseComponent} from "@intuitionrobotics/thunderstorm/app-frontend/core/BaseComponent";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {generateUUID} from "@intuitionrobotics/ts-common/utils/random-tools";

interface OnStam {
    __onStam(s: string): void
}

export class App
    extends React.Component {
    render() {
        return (
            <div>
                <button
                onClick={() => XhrHttpModule
                    .createRequest(HttpMethod.GET, "ping")
                    .setRelativeUrl("/ping")
                    .execute((response) => {
                        alert('Api responded with ' + response)
                    })
                }
                >Ping</button>
                <button
                    onClick={() => new ThunderDispatcher<OnStam, "__onStam">("__onStam").dispatchUI([generateUUID()])
                    }
                >Dispatch</button>
                Hello World
                <MyComponent />
            </div>);
    }
}

class MyComponent extends BaseComponent {

    __onStam(s: string){
        this.setState({s})
    }

    render() {
        return <div>s is {this.state?.s}</div>;
    }

}

