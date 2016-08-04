import * as React from "react";

// Features is the set of all feature flags that can
// be queried by the frontend app. This list is usually a subset
// of the feature flags in the ./conf/feature package.
export interface Features {
	"Authors": any;
	"GodocRefs": any;
	"_testingDummyFeature": any; // used by tests only
};

let _globalFeatures: Features | null = null; // private, access via withFeaturesContext and this.context.features

// setGlobalFeatures sets the feature flags that will be provided to
// React components via the withFeaturesContext wrapper and
// "this.context.features" context item.
//
// This module assumes that the features object is immutable
// and it and its subkeys will not change. Violating this will result in
// undefined behavior.
export function setGlobalFeatures(features: any): void {
	_globalFeatures = features;
}

// withFeaturesContext passes a "features" context item
// to Component's children and lets them query the
// feature flags.
export function withFeaturesContext<P>(component: React.ComponentClass<P>): React.ComponentClass<P> {
	class WithFeatures extends React.Component<P, {}> {
		static childContextTypes: React.ValidationMap<any> = {
			features: React.PropTypes.object,
		};

		getChildContext(): {features: Features} {
			if (!_globalFeatures) { throw new Error("features not set"); }
			return {features: _globalFeatures};
		}

		render(): JSX.Element | null {
			return React.createElement(component, this.props);
		}
	}
	return WithFeatures;
}
