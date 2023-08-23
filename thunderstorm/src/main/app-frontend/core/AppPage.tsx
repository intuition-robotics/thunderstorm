import {BaseComponent} from "./BaseComponent";
import {ThunderDispatcher} from "./thunder-dispatcher";

export interface OnPageTitleChangedListener {
	onPageTitleChanged(title: string): void;
}

export const dispatch_onPageTitleChanged = new ThunderDispatcher<OnPageTitleChangedListener, "onPageTitleChanged">("onPageTitleChanged");


export abstract class AppPage<P, S>
	extends BaseComponent<P, S> {

	private pageTitle: string;
	private prevTitle!: string;
	private mounted: boolean = false;

	protected constructor(p: P, pageTitle?: string) {
		super(p);
		this.pageTitle = pageTitle || document.title;
	}

	setPageTitle(pageTitle: string) {
		this.pageTitle = pageTitle;
		if (this.mounted)
			document.title = this.pageTitle;
	}

	componentDidMount() {
		this.logDebug(`Mounting page: ${this.pageTitle}`);
		this.prevTitle = document.title;
		document.title = this.pageTitle;
		this.mounted = true;
	}

	componentWillUnmount() {
		document.title = this.prevTitle;
		super.componentWillUnmount?.();
	}
}
