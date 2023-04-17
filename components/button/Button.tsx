import styled from 'styled-components'

export const Btn = styled.button`
  display: inline-block;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  width: 100%;
  max-width: 320px;
  padding: 8px;
  white-space: nowrap;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  &:disabled{
    cursor: not-allowed;
  }
`
