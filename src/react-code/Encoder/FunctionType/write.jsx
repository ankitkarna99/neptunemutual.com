import './write.scss'

import {
  useId,
  useMemo,
  useState
} from 'react'

import { Button } from '../../components/Button/Button'
import { InputWithLabel } from '../../components/InputWithLabel'
import {
  checkEmptyInputs,
  checkInputErrors,
  getWriteArguments
} from '../helpers/web3-tools/abi-encoder'
import { InputFields } from '../components/InputFields'
import { useWeb3React } from '@web3-react/core'

import { config } from '../../../data/protocol'

const WriteContract = (props) => {
  const [inputData, setInputData] = useState({})
  const [error, setError] = useState('')
  const [makingCall, setMakingCall] = useState(false)
  const [hash, setHash] = useState('')

  const { chainId } = useWeb3React()
  const explorerUrl = useMemo(() => config[chainId || 1].explorer.replace('address/', '') + 'tx/', [chainId])

  const { func, call, joiSchema, isReady, encodeInterface: iface } = props
  const { inputs, name, stateMutability } = func

  async function handleWrite () {
    setError('')
    setHash('')
    setMakingCall(true)

    const methodName = name
    const methodArgs = getWriteArguments(func, inputData)

    const hasPayableStateMutability = func?.stateMutability === 'payable'
    const value = inputData[name]

    const { error: _error, hash: _hash } = await call(methodName, methodArgs, hasPayableStateMutability && { value }, iface)

    if (_hash) setHash(_hash)

    if (_error) setError(_error)

    setMakingCall(false)
  }

  const handleInputChange = (name, value = '') => {
    setInputData(_prev => ({ ..._prev, [name]: value }))
    if (error) setError('')
  }

  return (
    <div className='write container'>
      <InputFields
        func={func}
        inputData={inputData}
        handleChange={handleInputChange}
        schema={joiSchema}
      />

      <div className='btn wrapper'>
        <Button
          variant='primary'
          size='sm'
          onClick={handleWrite}
          disabled={!isReady ||
            checkEmptyInputs(inputs, inputData, name, stateMutability) ||
            checkInputErrors(joiSchema, inputData) ||
            makingCall
          }
        >
          {makingCall ? 'Transaction in progress...' : 'Write'}
        </Button>

        {
          hash && (
            <Button
              type='anchor'
              size='sm'
              href={explorerUrl + hash}
              target="_blank"
              rel="noreferrer nofollow"
            >
              View Transaction
            </Button>
          )
        }
        <span className='error'>{error}</span>
      </div>

    </div>
  )
}

export { WriteContract }
