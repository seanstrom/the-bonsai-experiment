import is from 'ramda/src/is';
import map from 'ramda/src/map';
import set from 'ramda/src/set';
import pipe from 'ramda/src/pipe';
import lens from 'ramda/src/lensProp';
import always from 'ramda/src/always';
import reduce from 'ramda/src/reduce';
import toPairs from 'ramda/src/toPairs';
import fromPairs from 'ramda/src/fromPairs';
import console from 'global/console';

const msgSymbol = Symbol('msg');

const isFunction = is(Function);

const toPrimitive = key => `${key}`;

const isNull = (value) => value === null;

const isMsg = (value) => Boolean(value[msgSymbol]);

const isMsgThunk = (value) => isMsg(value) && isFunction(value);

const affect = (effect, dispatch) => isFunction(effect) ? effect(dispatch) : null;

const send = dispatch => msg => isMsgThunk(msg) ? dispatch(msg()) : dispatch(msg);

const log = (message) => isMsgThunk(message) ? log(message()) : console.log(message);

const withMsgSymbol = (obj) => {
    obj[msgSymbol] = true;
    return obj;
};

const withToPrimitive = (type, obj) => {
    obj[Symbol.toPrimitive] = always(type);
    return obj;
};

const toMsgType = (type) => {
    const fn = (value) => withToPrimitive(type, { type, value });
    return withMsgSymbol(withToPrimitive(type, fn));
};

const toMsgTypes = (keys) => {
    return reduce((msgs, key) => (
        set(lens(key), toMsgType(key), msgs)
    ), {}, keys);
};

const match = (matchers) => {
    const keyToPrimitive = ([key, value]) => [toPrimitive(key), value];
    const matchersByPrimitive = pipe(toPairs, map(keyToPrimitive), fromPairs)(matchers);

    return (model, msg) => {
        const primitive = toPrimitive(msg);
        const update = matchersByPrimitive[primitive] || matchersByPrimitive._;
        return update(model, msg);
    };
}

export {
    affect,
    isFunction,
    isMsg,
    isMsgThunk,
    isNull,
    log,
    match,
    send,
    toMsgType,
    toMsgTypes,
    toPrimitive,
    withToPrimitive
};
