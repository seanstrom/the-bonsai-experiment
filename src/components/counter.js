import preact from 'preact';
import clone from 'ramda/src/clone';
import { match, send, toMsgTypes as _msgs } from '../lib/utils';
import { log, getDocumentDimensions, sleepTwoSeconds } from '../lib/effects';

// Model & Msgs

const Model = 0;

const Msg = _msgs([
    'Inc',
    'Dec',
    'Async',
    'Dimensions'
]);

// Init

const init = (options) => {
    return [clone(Model), sleepTwoSeconds(Msg.Inc)];
};

// Subscriptions

const subscriptions = (model) => {
    if (model % 2 === 0) {
        return getDocumentDimensions(Msg.Dimensions);
    }

    return null;
};

// Update

const update = match({
    [Msg.Inc]: (model) =>
        [model + 1, null],

    [Msg.Dec]: (model) =>
        [model - 1, null],

    [Msg.Async]: (model) =>
        [model, sleepTwoSeconds(Msg.Inc)],

    [Msg.Dimensions]: (model, msg) =>
        [model, log(msg.value)],

    _: (model) =>
        [model, null]
});

// View

const view = (model, actions) => {
    return (
        <div>
            { model }
            <button onClick={actions.inc}>Inc</button>
            <button onClick={actions.dec}>Dec</button>
            <button onClick={actions.async}>Async</button>
        </div>
    );
};

const connect = (view) => (model, _dispatch) => {
    const dispatch = send(_dispatch)

    const actions = {
        inc: () => dispatch(Msg.Inc),
        dec: () => dispatch(Msg.Dec),
        async: () => dispatch(Msg.Async)
    };

    return view(model, actions);
};


export  { connect, init, subscriptions, update, view };
