// Sample Initializer for test

let initialized = false;

export default () => {
  initialized = true;
};

export const getInitialized = () => initialized;
