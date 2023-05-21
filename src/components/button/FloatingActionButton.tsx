import styled from 'styled-components';
import Color from '../const/Color';

const FloatingActionButton = styled.button`
  position: fixed;
  right: 16px;
  bottom: 16px;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
  background-color: ${Color.ACCENT};
  &:hover {
    background-color: ${Color.ACCENT_HOVER};
  }
  * {
    pointer-events: none;
  }
  i:before {
    font-size: 28px;
    color: white;
  }
`;
export default FloatingActionButton;
