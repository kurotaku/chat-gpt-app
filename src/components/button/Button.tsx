import Link from 'next/link';
import styled from 'styled-components';
import Color from '../const/Color';

const Btn = styled.button`
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
  font-size: 16px;
  &:disabled {
    cursor: not-allowed;
  }
`;

const BtnSmall = styled.button`
  display: inline-block;
  text-align: center;
  text-decoration: none;
  border-radius: 200px;
  min-width: 120px;
  padding: 4px 8px;
  white-space: nowrap;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  font-size: 14px;
  &:disabled {
    cursor: not-allowed;
  }
`;
export const AccentBtn = styled(Btn)`
  background-color: ${Color.ACCENT};
  &:hover {
    background-color: ${({ disabled }) => !disabled && Color.ACCENT_HOVER};
  }
`;

export const BorderdBtn = styled(Btn)`
  color: #777;
  border-color: #ccc;
`;

export const AccentLinkBtn = styled(Btn.withComponent(Link))`
  background-color: ${Color.ACCENT};
  &:hover {
    background-color: ${Color.ACCENT_HOVER};
  }
`;

export const BorderdBtnSmall = styled(BtnSmall)`
  color: #777;
  border-color: #ccc;
`;
export const BorderdLinkBtnSmall = styled(BtnSmall.withComponent(Link))`
  color: #777;
  border-color: #ccc;
`;
