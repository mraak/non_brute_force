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
  grid-gap: 21.5px;
  grid-template-columns: repeat(3, 419px);
`;
export const NavItem = styled(NavLink)`
  border-bottom: 5px solid ${colors.border};
  color: ${colors.border};
  display: grid;
  font-size: 25px;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;

  &.active {
    border-bottom: 5px solid ${colors.navigation};
    color: ${colors.navigation};
  }
`;

export const Title = styled.h3`
  color: ${colors.label};
  display: grid !important;
  font-size: 25px;
  height: 46px;
  margin: 0;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;
`;

export const Label = styled.div`
  color: ${colors.label};
  display: flex !important;
  font-size: 20px;
  line-height: 19px;
  text-transform: uppercase;
`;
export const Value = styled.div`
  color: ${({ human }) => human ? colors.valueHuman : colors.valueAnimal};
  display: flex !important;
  font-size: 25px;
  line-height: 19px;
  justify-content: flex-end;
  text-transform: uppercase;
`;
export const BigValue = styled.div`
  align-items: flex-end;
  color: ${({ human }) => human ? colors.valueHuman : colors.valueAnimal};
  display: flex !important;
  font-size: 50px;
  height: 52px;
  line-height: 37px;
  justify-content: flex-end;
  text-transform: uppercase;
`;

export const Center = styled.div`
  display: grid;
  place-items: center;
`;

export const Panel = styled.div`
  border: 2px solid ${colors.border};
  border-radius: 4px;
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
  display: flex;
  height: ${({ small }) => small ? "34px" : "52px" };
  justify-content: space-between;
  padding-left: 22px;
  padding-right: 22px;
`;
export const Chart = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 17px;
  height: 479px;
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
  background-color: ${colors.border};
  border: 2px solid ${colors.navigation};
  border-radius: 5px;
  color: ${colors.label};
  font-size: 25px;
  height: 53px;
  padding: 0;
  text-transform: uppercase;
  width: 190px;
`;

export const HR = styled.div`
  border-top: 2px solid ${colors.border};
`;
