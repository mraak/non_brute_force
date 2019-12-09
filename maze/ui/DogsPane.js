import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Tabs, Tab,
  Box,
  FormField,
  Text
} from "mineral-ui";

export default () => {
  const dispatch = useDispatch();

  const dogIndex = useSelector((state) => state.dogs.selectedIndex);
  const dogs = useSelector((state) => state.dogs.dogs);

  return (
    <Tabs position="start" label="Dogs"
      selectedTabIndex={dogIndex}
      onChange={(index) => dispatch({ type: "dogs/selectedIndex", payload: index })}>
      {dogs.map(
        (dog) => (
          <Tab key={dog.name} title={dog.name}>
            <Box padding={10}>
              <FormField label="Learning Rate">
                <Text>{dog.learningRate}</Text>
              </FormField>
              {/* <FormField label="Exploration Threshold">
                <Text>{dog.explorationThreshold}</Text>
              </FormField>
              <FormField label="Exploration Threshold Delta">
                <Text>{dog.explorationThresholdDelta}</Text>
              </FormField>
              <FormField label="Backtracking Threshold">
                <Text>{dog.backtrackingThreshold}</Text>
              </FormField> */}
            </Box>
          </Tab>
        )
      )}
    </Tabs>
  );
};
