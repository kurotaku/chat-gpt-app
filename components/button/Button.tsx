import styled from 'styled-components'
import Color from '../const/Color'

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
  color: white;
  &:disabled{
    cursor: not-allowed;
  }
`
export const AccentBtn = styled(Btn)`
  background-color: ${Color.ACCENT};
  &:hover{
    background-color: ${({ disabled }) => !disabled && Color.ACCENT_HOVER};
  }
`