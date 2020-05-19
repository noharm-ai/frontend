import styled from 'styled-components/macro';
import { ReactComponent as LogoSVG } from '@assets/noHarm.svg';

export const Feedback = styled.div`
	color: #333;
	text-align: center;
	font-size: 20px;
	border: 0;
	box-shadow: 0 1px 2px 0 rgba(60,64,67,.30), 0 2px 6px 2px rgba(60,64,67,.15);
	background: #fff;
	border-radius: 8px;
	min-width: 300px;
	padding: 32px 24px;

	.legend {
		font-size: 12px;
		text-align: center;
		display: flex;
		justify-content: space-between;
		padding: 0 10px;
	}

	.fortune {
		padding-top: 20px;
		font-style: italic;
		font-size: 18px;
	}

`;

export const Stars = styled.div`
	padding-top: 10px;

	span {
		cursor: pointer;
	}

	svg {
	    height: 42px;
	    width: 42px;
	    margin: 10px;
	}
`;


export const Brand = styled(LogoSVG)`
  display: block;
  margin: 0 auto 20px;
  max-width: 213px;
  width: 100%;
`;