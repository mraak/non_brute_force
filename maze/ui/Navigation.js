import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  PrimaryNav
} from "mineral-ui";

export default () => {
  const dispatch = useDispatch();

  const viewIndex = useSelector((state) => state.views.selectedIndex);

  const dogIsValid = useSelector((state) => state.dogs.isValid);
  const mapIsValid = useSelector((state) => state.maps.isValid);

  const items = [
    {
      text: "Maps",
    },
    {
      text: "Dogs",
      disabled: !mapIsValid,
    },
    {
      text: "Run",
      disabled: !mapIsValid || !dogIsValid,
    },
  ];

  return (
    <PrimaryNav items={items}
      selectedIndex={viewIndex}
      onChange={(index) => dispatch({ type: "views/selectedIndex", payload: index })} />
  );
};
