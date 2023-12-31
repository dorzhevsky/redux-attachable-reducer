import { ReactReduxContext } from "react-redux";
import PropTypes from "prop-types";
import React, { useContext } from "react";

const attachReducer = reducer => Comp => {
  class Wrapper extends React.Component {
    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount = () => {
      const { store, reducer: r } = this.props;
      if (store.attachReducer) {
        store.attachReducer(r);
      }
    };

    render = () => {
      return this.props.children;
    };
  }

  Wrapper.propTypes = {
    store: PropTypes.shape({
      attachReducer: PropTypes.func
    }),
    reducer: PropTypes.shape({}),
    children: PropTypes.node
  };

  return props => {
    const { store } = useContext(ReactReduxContext);
    return (
      <Wrapper store={store} reducer={reducer}>
        <Comp {...props} />
      </Wrapper>
    );
  };
};

export default attachReducer;
