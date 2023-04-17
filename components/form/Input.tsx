import styled from 'styled-components'

const Input = styled.div`
  border-radius: 8px;
  width: 100%;
  max-width: 320px;
  padding: 8px;
  border-width: 2px;
  border-style: solid;
`

export const TextArea = styled(Input.withComponent('textarea'))`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  resize: none;
  outline: none;
  background: transparent;
`

export const TextField = styled(Input.withComponent('input'))`
`
