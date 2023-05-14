import styled from 'styled-components';
import Color from '../const/Color';

export const Header = styled.header`
  padding: 24px;
  background: white;
  border-bottom: 1px solid ${Color.BORDER_COLOR};
  font-size: 20px;
  display: flex;
  align-items: flex-start;
  h1,
  p {
    color: ${Color.PRIMARY};
    font-weight: bold;
    letter-spacing: 0.16rem;
  }
`;

export const Breadcrumb = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${Color.BORDER_COLOR};
  font-size: 16px;
  display: flex;
  align-items: center;
  span {
    color: ${Color.PRIMARY};
    font-weight: bold;
    display: inline-block;
    margin-right: 8px;
  }
  i:before {
    font-size: 26px;
    color: ${Color.PRIMARY};
    display: inline-block;
    margin-right: 8px;
  }
`;
