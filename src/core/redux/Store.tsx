import logger from 'redux-logger';
import { configureStore, Middleware, EnhancedStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import reducer from './root-reducer';
import saga from './root-saga';

const sagaMiddleware = createSagaMiddleware();

const middleware: Middleware[] = [sagaMiddleware];

const devEnv = process.env.NODE_ENV !== 'production';

if (devEnv) {
  middleware.push(logger);
}

export default (): EnhancedStore => {
  const store = configureStore({
    reducer,
    devTools: devEnv,
    middleware,
  });

  sagaMiddleware.run(saga);
  return store;
};
