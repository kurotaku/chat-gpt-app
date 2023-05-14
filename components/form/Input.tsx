import styled from 'styled-components';
import Color from '../const/Color';

const Input = styled.div`
  border-radius: 8px;
  width: 100%;
  max-width: 320px;
  padding: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: ${Color.BORDER_COLOR};
  &:focus {
    border-color: ${Color.ACCENT};
  }
`;

export const TextArea = styled(Input.withComponent('textarea'))`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  resize: none;
  outline: none;
  background: transparent;
  max-width: 100%;
  background-color: white;
`;

export const TextField = styled(Input.withComponent('input'))``;
