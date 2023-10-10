import {Module} from "@intuitionrobotics/ts-common/core/module";
import * as React from "react";
import {defaultLinkNode, defaultNavLinkNode, defaultRouteNode, RouteParams, RoutePath} from "./route";
import {Redirect, Switch} from "react-router-dom";
import {BrowserHistoryModule} from "../HistoryModule";
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";

class RoutingModule_Class
    extends Module<{}> {
    private readonly routes: { [key: string]: RoutePath } = {};
    private readonly ordinalRoutes: string[] = [];

    private readonly createNavLinkNode: (route: RoutePath) => React.ReactElement;
    private readonly createRouteNode: (route: RoutePath) => React.ReactElement;
    private readonly createLinkNode: (route: RoutePath, node?: React.ReactNode) => React.ReactElement;

    constructor() {
        super("RoutingModule");
        this.createNavLinkNode = defaultNavLinkNode;
        this.createLinkNode = defaultLinkNode;
        this.createRouteNode = defaultRouteNode;
    }

    init() {
    }

    clearRoutes() {
        for (const item of this.ordinalRoutes) {
            delete this.routes[item];
        }
        this.ordinalRoutes.splice(0);
    }

	addRoute(key: string, route: string, component: React.ComponentType<any> | string) {
		const previousRoute = this.routes[key];
		if (previousRoute)
			throw new BadImplementationException(
				`Route key '${key}' MUST be unique!!\n  Found two routes with matching key: '${route}' && '${previousRoute.path}'`);

        this.ordinalRoutes.push(key)
        return this.routes[key] = new RoutePath(key, route, component);
    }

    getRoute(key: string) {
        const route = this.routes[key];
        if (!route)
            throw new BadImplementationException(`No Route for key '${key}'... Did you forget to add it??`);

        return route;
    }

    getPath(key: string) {
        return this.getRoute(key).path;
    }

    goToRoute(key: string, params?: RouteParams) {
        const pathname = this.getPath(key);
        const search = RoutePath.composeStringQuery(params);

        BrowserHistoryModule.push({pathname, search});
    }

    redirect(key: string) {
        return <Redirect to={RoutingModule.getPath(key)}/>;
    }

    getMyRouteKey = () => Object.keys(this.routes).find(key => this.routes[key].path === BrowserHistoryModule.getCurrent().pathname);

    // need to figure out how to create parameterized urls from this call !!
    getNavLinks(keys: string[]) {
        return keys.map(key => this.getRoute(key)).filter(route => route.visible && route.visible()).map(route => this.createNavLinkNode(route));
    }

    getNavLink(key: string) {
        return this.createNavLinkNode(this.getRoute(key));
    }

    getLink(key: string) {
        return this.createLinkNode(this.getRoute(key));
    }

    getRoutesMap(keys?: string[]) {
        return <Switch>
            {(keys || this.ordinalRoutes).map(key => this.createRouteNode(this.getRoute(key)))}
        </Switch>;
    }
}

export const RoutingModule = new RoutingModule_Class();
