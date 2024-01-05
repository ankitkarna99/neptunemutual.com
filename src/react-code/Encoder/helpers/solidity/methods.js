import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80
})

const GAS_MARGIN_MULTIPLIER = 1.5

const parseError = (iface, errorData) => {
  try {
    const errorDescription = iface.parseError(errorData)

    const message = `${errorDescription.name}(${errorDescription.args.join(', ')})`

    return message
  } catch (error) {
    // swallow
    // console.error(error)
  }
}

const getErrorMessage = (_error, iface = null) => {
  try {
    const error = _error.error || _error
    if (!error || !error.message) {
      return 'Unexpected Error Occurred'
    }

    if (iface && error.data.data) {
      const parsedError = parseError(iface, error.data.data)
      if (parsedError) return `Error: ${parsedError.name}`
    }

    if (error?.reason) return error.reason

    if (error?.data?.message) {
      return error.data.message.trim().replace('execution reverted: ', '')
    } else if (error?.data?.originalError?.message) {
      return error.data.originalError.message
        .trim()
        .replace('execution reverted: ', '')
    }

    return error.message.trim().replace('MetaMask Tx Signature: ', '')
  } catch (error) {
    return 'Something went wrong'
  }
}

const calculateGasMargin = (value) => {
  return new BigNumber(value.toString())
    .multipliedBy(GAS_MARGIN_MULTIPLIER)
    .decimalPlaces(0)
    .toString()
}

const encodeData = (encodeInterface, methodName, methodArgs = [], onError = (err) => console.error(err)) => {
  if (!encodeInterface || !methodName) return

  try {
    const encoded = encodeInterface.encodeFunctionData(methodName, methodArgs)
    return encoded
  } catch (error) {
    // console.log(`Error in encoding ${methodName}\n`, { methodArgs, error })
    onError(getErrorMessage(error))
  }
}

export {
  calculateGasMargin,
  encodeData,
  GAS_MARGIN_MULTIPLIER,
  getErrorMessage
}
