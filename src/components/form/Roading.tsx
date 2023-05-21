import React from 'react';
import styled, { keyframes } from 'styled-components';

const loadingAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0.5);
  }
  40% {
    transform: scale(1);
  }
`;

const DotWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 4px;
  border-radius: 50%;
  animation: ${loadingAnimation} 1.4s infinite;

  &:nth-child(2) {
    animation-delay: -0.7s;
  }

  &:nth-child(3) {
    animation-delay: -0.3s;
  }
`;

const Roading = () => {
  return (
    <DotWrap className='mb-6'>
      <LoadingDot className='bg-cyan-900' />
      <LoadingDot className='bg-cyan-900' />
      <LoadingDot className='bg-cyan-900' />
    </DotWrap>
  );
};

export default Roading;
