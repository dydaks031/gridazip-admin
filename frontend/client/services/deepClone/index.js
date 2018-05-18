import {clone, each, isObject} from 'underscore'

const deepClone = (_obj) => {
  let _clone = clone(_obj)
  each(_clone, (_val, _key) => {
    if (isObject(_val)) {
      _clone[_key] = deepClone(_val)
    }
  })
  return _clone
}

export default deepClone
