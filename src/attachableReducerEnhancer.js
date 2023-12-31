import _reduceReducers from "reduce-reducers";
import keys from "lodash/keys";
import map from "lodash/map";
import isFunction from "lodash/isFunction";
import _combineAttachedReducers from "./combineAttachedReducers";
import { ATTACHABLE_REDUCER_ATTACHED, KEY_PARTS_SEPARATOR } from "./constants";
import wrapAttachedReducer from "./wrapAttachedReducer";

const attachableReducerEnhancer = (
  { combineAttachedReducers, combineAll } = {
    combineAttachedReducers: _combineAttachedReducers,
    combineAll: _reduceReducers
  }
) => createStore => (reducer, ...other) => {
  const store = createStore(reducer, ...other);

  const attachedReducers = new Map();

  const attachReducer = pathObject => {
    const stack = [{ obj: pathObject, path: [] }];
    // eslint-disable-next-line no-loops/no-loops
    while (stack.length > 0) {
      const { obj, path } = stack.pop();
      if (isFunction(obj)) {
        const reducerToAttach = obj;
        const key = path.join(KEY_PARTS_SEPARATOR);
        if (attachedReducers.has(key)) {
          return;
        }
        attachedReducers.set(key, wrapAttachedReducer(key, reducerToAttach));
        const newReducer = combineAll(
          reducer,
          combineAttachedReducers(Object.fromEntries(attachedReducers))
        );
        store.replaceReducer(newReducer);
        store.dispatch({ type: ATTACHABLE_REDUCER_ATTACHED, key });
        return;
      }
      const newItems = map(keys(obj), k => {
        return { obj: obj[k], path: [...path, k] };
      });
      stack.push(...newItems);
    }
  };

  store.attachReducer = attachReducer;

  return store;
};

export default attachableReducerEnhancer;
