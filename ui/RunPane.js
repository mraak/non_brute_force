import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Box,
  Flex, FlexItem,
  Tabs, Tab,
  Menu, MenuItem,
  Text, TextArea,
  ButtonGroup, Button,
  FormField, FormFieldDivider,
  TextInput
} from "mineral-ui";

export default () => {
  const dispatch = useDispatch();

  const dogName = useSelector((state) => state.dogs.current.name);
  const dogLearningRate = useSelector((state) => state.dogs.current.learningRate);
  const mapName = useSelector((state) => state.maps.current.name);
  const mapComplexity = useSelector((state) => state.maps.complexity);
  const mapComplexityRank = useSelector((state) => state.maps.complexityRank);
  const iterationSpeed = useSelector((state) => state.run.iterationSpeed);
  const paused = useSelector((state) => state.run.paused);
  const training = useSelector((state) => state.run.training);
  const endless = useSelector((state) => state.run.endless);

  return (
    <Box padding={10}>
      <Flex direction="row" gutterWidth={10}>
        <FlexItem>
          <FormField label="Dog">
            <Text>{dogName}</Text>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label="Learning Rate">
            <Text>{dogLearningRate}</Text>
          </FormField>
        </FlexItem>
      </Flex>
      <Flex direction="row" gutterWidth={10}>
        <FlexItem>
          <FormField label="Map">
            <Text>{mapName}</Text>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label="Complexity (rank)">
            <Text>{mapComplexity} ({mapComplexityRank})</Text>
          </FormField>
        </FlexItem>
      </Flex>
      <Flex direction="row" gutterWidth={10}>
        <FlexItem>
          <FormField label="Toggle Train">
            <Button onClick={() => dispatch({ type: "run/training", payload: !training })}>{training ? "Stop Training" : "Start Training"}</Button>
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label="Toggle Pause">
            <Button disabled={!training} onClick={() => dispatch({ type: "run/paused", payload: !paused })}>{paused ? "Paused" : "Running"}</Button>
          </FormField>
        </FlexItem>
      </Flex>
      <FormFieldDivider />
      <Flex direction="row" gutterWidth={10}>
        <FlexItem>
          <FormField label="Iteration Speed">
            <TextInput type="number" min={1} max={10}
              value={`${iterationSpeed}`}
              onChange={(event) => {
                event.stopPropagation();
                dispatch({ type: "run/iterationSpeed", payload: event.target.value });
              }} />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField label="Endless Mode">
            <Button onClick={() => dispatch({ type: "run/endless", payload: !endless })}>{endless ? "On" : "Off"}</Button>
          </FormField>
        </FlexItem>
      </Flex>
    </Box>
  );
};