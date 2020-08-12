import {
  NavLink
} from "react-router-dom";
import styled from "styled-components";

import * as colors from "./colors";

export const Image = styled.img`
  display: block;
  width: 100%;
`;


export const Navigation = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 69px;
  grid-gap: 21.5px;
  grid-template-columns: repeat(3, 419px);
  padding-left: 17px;
  padding-right: 17px;
`;
export const NavItem = styled(NavLink)`
  border-bottom: 5px solid ${colors.navigation};
  color: ${colors.navigation};
  display: grid;
  font-size: 25px;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;

  &.active {
    border-bottom: 5px solid ${colors.label};
    color: ${colors.label};
  }
`;

export const Title = styled.h3`
  color: ${colors.title};
  display: grid !important;
  font-size: 25px;
  // height: 45px;
  margin: 0;
  padding: 17px;
  place-items: center;
  text-decoration: none;
  text-transform: uppercase;
`;

export const Label = styled.div`
  align-items: flex-end;
  color: ${colors.label};
  display: flex !important;
  font-size: 25px;
  line-height: 19px;
  justify-content: flex-start;
  text-transform: uppercase;
`;
export const Value = styled.div`
  align-items: flex-end;
  color: ${({ human }) => human ? colors.valueHuman : colors.valueAnimal};
  display: flex !important;
  font-size: 50px;
  line-height: 37px;
  justify-content: flex-end;
  text-transform: uppercase;
`;

export const Panel = styled.div`
  border: 2px solid ${colors.border};
  border-radius: 4px;
  padding-bottom: 17px;
`;

export const Table = styled.div`
  display: grid;
  grid-auto-flow: row;
  // grid-auto-rows: minmax(51px, 1fr);
  grid-gap: 17px;
  grid-template-columns: 2fr 3fr 1fr;
  padding-left: 17px;
  padding-right: 17px;
  padding-top: 17px;
`;

export const Button = styled.button`
  background-color: ${colors.border};
  border: 2px solid ${colors.navigation};
  border-radius: 4px;
  color: ${colors.label};
  font-size: 25px;
  padding: 17px;
  text-transform: uppercase;
`;

export const HR = styled.div`
  border-top: 2px solid ${colors.border};
`;
