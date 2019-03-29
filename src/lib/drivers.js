import flyd from 'flyd';
import { render as _render } from 'preact';
import { isNull, affect as utilAffect, log as utilLog } from './utils';

const log = (messages$) => {
    flyd.on(utilLog, messages$);
};

const render = (selector) => (view$) => {
    flyd.on((view) => {
        const element = document.querySelector(selector);
        _render(view, element, element.lastChild);
    }, view$);
};

const affect = (effects$, app) => {
    flyd.on((effect) => {
        const dispatch = app.messages$;
        utilAffect(effect, dispatch);
    }, effects$);
};

const manage = (subscriptions$, app) => {
    const dispatch = app.messages$;

    const initialLifecycle = {
        cancel: null,
        effect: null,
        subscriptions: null
    };

    const subAndUnsub$ = flyd.scan((lifecycle, subscriptions) => {
        const shouldSubscribe = isNull(lifecycle.subscriptions) && !isNull(subscriptions);
        const shouldUnsubscribe = !isNull(lifecycle.subscriptions) && isNull(subscriptions);

        if (shouldSubscribe) {
            const nextLifeCycle = {
                cancel: null,
                effect: null,
                subscriptions
            };

            nextLifeCycle.effect = () => {
                nextLifeCycle.cancel = utilAffect(subscriptions, dispatch);
            };

            return nextLifeCycle;
        }

        if (shouldUnsubscribe) {
            return {
                cancel: null,
                effect: lifecycle.cancel,
                subscriptions
            };
        }

        return {
            effect: null,
            cancel: lifecycle.cancel,
            subscriptions
        };
    }, initialLifecycle, subscriptions$);

    flyd.on(
        ({ effect }) => utilAffect(effect, dispatch),
        subAndUnsub$
    );
};

export { affect, log, manage, render };
