import {
  NavLink
} from "react-router-dom";
import styled from "styled-components";

import * as colors from "./colors";

export const Image = styled.img`
  display: block;
  width: 100%;
`;


export const Navigation = styled.header`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 67px;
  // grid-gap: 21.5px;
  grid-template-columns: repeat(3, 1fr);
`;
export const NavItem = styled(NavLink)`
  border-bottom: 1px solid ${colors.array[3]};
  color: ${colors.array[3]};
  display: grid;
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 4px;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;

  &.active {
    border-bottom: 5px solid ${colors.array[6]};
    color: ${colors.array[6]};
  }
`;

export const Title = styled.h3`
  color: ${colors.array[5]};
  display: grid !important;
  font-size: 20px;
  height: 46px;
  letter-spacing: 2px;
  margin: 0;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;
`;

export const Label = styled.div`
  color: ${colors.array[5]};
  display: flex !important;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 19px;
  text-transform: uppercase;
`;
export const Value = styled.div`
  color: ${colors.array[6]};
  display: flex !important;
  font-size: 25px;
  letter-spacing: 1px;
  line-height: 19px;
  justify-content: flex-end;
  text-transform: uppercase;
`;
export const BigValue = styled.div`
  align-items: flex-end;
  color: ${colors.array[6]};
  display: flex !important;
  font-size: 50px;
  height: 52px;
  letter-spacing: 1px;
  line-height: 37px;
  justify-content: flex-end;
  text-transform: uppercase;
`;

export const Spacer = styled.div`
  flex: 1;
`;

export const Center = styled.div`
  display: grid;
  place-items: center;
`;

export const Panel = styled.div`
  border: 2px solid ${colors.array[1]};
  border-radius: 4px;
  display: flex;
  flex-direction: column;

  // display: grid;
  // grid-auto-flow: row;
`;
export const Table = styled.div`
  align-items: end;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 52px;
  grid-gap: 7px;
  grid-template-columns: 70px 157px 46px;
  padding-left: 22px;
  padding-right: 22px;
`;
export const Apart = styled.div`
  align-items: center;
  background-color: ${colors.array[4]};
  display: flex;
  height: ${({ small }) => small ? "34px" : "52px" };
  justify-content: space-between;
  padding-left: 22px;
  padding-right: 22px;
`;
export const Chart = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 17px;
  // height: 479px;
  padding-left: 22px;
  padding-right: 22px;
`;

export const Span2 = styled.div`
  grid-column: span 2;
`;
export const Span3 = styled.div`
  grid-column: span 3;
`;

export const Button = styled.button`
  background-color: ${colors.array[9]};
  border: 2px solid ${colors.array[10]};
  border-radius: 5px;
  color: ${colors.array[5]};
  font-size: 25px;
  height: 53px;
  letter-spacing: 1px;
  padding: 0;
  text-transform: uppercase;
  width: 190px;
`;

export const HR = styled.div`
  border-top: 2px solid ${colors.array[1]};
`;
export const VR = styled.div`
  border-left: 2px solid ${colors.array[1]};
`;

export const Horizontal = styled.div`
  background-color: ${colors.array[4]};
  display: flex;
  flex: 1;
  flex-direction: row;
`;
export const Vertical = styled.div`
  display: flex;
  flex-direction: column;

  & > .recharts-wrapper, & > .graph {
    background-color: ${colors.array[0]};
    border-bottom: 1px solid ${colors.array[1]};
    border-left: 1px solid ${colors.array[1]};
  }
`;
export const LabelX = styled.div`
  align-items: center;
  color: ${colors.array[5]};
  display: flex;
  font-size: 15px;
  height: 25px;
  justify-content: center;
  letter-spacing: 1px;
`;
export const LabelY = styled.div`
  align-items: center;
  color: ${colors.array[5]};
  display: flex;
  font-size: 15px;
  justify-content: center;
  letter-spacing: 1px;
  transform: rotate(180deg);
  width: 25px;
  writing-mode: vertical-lr;
`;
