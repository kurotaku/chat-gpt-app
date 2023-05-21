import React, { Children } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Color from '../const/Color';

type Props = {
  children: React.ReactNode;
};

const Nav = styled.nav`
  width: 220px;
  flex: 0 0 auto;
  padding: 32px 16px;
  /* background: white; */
  border-right: 1px solid ${Color.BORDER_COLOR};
  > ul > li {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    a {
      display: block;
      color: ${Color.PRIMARY};
      padding: 8px 16px;
      border-radius: 4px;
      &.current,
      &:hover {
        background: #eceef4;
        color: ${Color.ACCENT};
      }
    }
  }
`;

const PageNav: React.FC<Props> = (props) => {
  const router = useRouter();

  return (
    <Nav>
      <ul>{props.children}</ul>
    </Nav>
  );
};

export default PageNav;
