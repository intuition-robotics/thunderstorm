import * as React from "react";
import {RoutingModule} from "@intuitionrobotics/thunderstorm/frontend";
import {Parent} from "./Parent";
import {Child1} from "./Child1";
import {Child2} from "./Child2";

export const Route_Home = "home";
export const Route_Login = "login";
export const Route_Playground = "playground";

export const registerRoutes = () => {
	RoutingModule.clearRoutes();

	//home route should be declared last
	RoutingModule.addRoute('child2', "/parent/child2", Child2).setLabel('Child2');
	RoutingModule.addRoute('child1', "/parent/child1", Child1).setLabel('Child1');
	RoutingModule.addRoute('parent', "/parent", Parent)
	RoutingModule.addRoute(Route_Home, "/", () => <>Hello World</>).setLabel("Home").setExact(false);
};
