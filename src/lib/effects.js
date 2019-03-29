import window from 'global/window';
import { isNull, log as utilLog } from './utils';

const log = (value, msg) => (dispatch) => utilLog(value);

const sleepTwoSeconds = (msg) => defer(2000, msg);

const defer = (ms, msg) => (dispatch) => {
    setTimeout(() => {
        dispatch(msg());
    }, ms);
};

const getDocumentDimensions = (msg) => (dispatch) => {
    let resizeTaskId = null;

    const handler = (event) => {
        if (!isNull(resizeTaskId)) {
            window.cancelAnimationFrame(resizeTaskId);
        }

        resizeTaskId = window.requestAnimationFrame(() => {
            const window = event.target;
            const element = window.document.documentElement;
            const height = element.clientHeight;
            const width = element.clientWidth;
            const measurements = { height, width };

            dispatch(msg(measurements));
        });
    };

    window.addEventListener('resize', handler);

    return () => {
        if (!isNull(resizeTaskId)) {
            window.cancelAnimationFrame(resizeTaskId);
        }

        window.removeEventListener('resize', handler);
    };
};

export { defer, getDocumentDimensions, log, sleepTwoSeconds };
