import flyd from 'flyd';
import head from 'ramda/src/head';
import last from 'ramda/src/last';
import keys from 'ramda/src/keys';
import forEach from 'ramda/src/forEach';

const run = (app, drivers) => {
    forEach((key) => {
        const input$ = app[key];
        const driver = drivers[key];

        driver(input$, app);
    }, keys(drivers));
};

const program = (internals, options) => {
    const [model, cmd] = internals.init(options);
    const messages$ = flyd.stream();

    const update$ = flyd.scan((state, msg) => {
        const model = head(state);
        return internals.update(model, msg);
    }, [model, cmd], messages$);

    const view$ = flyd.scan((previousView, update) => {
        const model = head(update);
        const dispatch = messages$;
        return internals.view(model, dispatch);
    }, internals.view(model, messages$), update$);

    const effects$ = flyd.map(last, update$);

    const subscriptions$ = flyd.scan((previousSubscriptions, update) => {
        const model = head(update);
        return internals.subscriptions(model);
    }, internals.subscriptions(model), update$);

    return {
        subscriptions$,
        messages$,
        effects$,
        update$,
        view$
    };
};

export { program, run };
