import { program, run } from './lib/program';
import { affect, log, manage, render } from './lib/drivers';
import { connect, init, update, view, subscriptions } from './components/counter';

const main = () => {
    const app = program({
        init,
        update,
        subscriptions,
        view: connect(view)
    }, {});

    run(app, {
        messages$: log,
        effects$: affect,
        view$: render('#app'),
        subscriptions$: manage
    });

    if (module.hot) {
        module.hot.dispose(() => app.subscriptions$(null));
        module.hot.accept();
    }
};

main();
