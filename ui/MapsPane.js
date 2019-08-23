import React, { Fragment } from "react";
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

const ExistingTab = () => {
  const dispatch = useDispatch();

  const maps = useSelector((state) => state.maps.maps);

  return (
    <Box padding={10}>
      <Menu>
        {maps.map(
          (map, i) => (
            <MenuItem key={i} secondaryText={map.name}
              onClick={() => dispatch({ type: "maps/current", payload: map })}>
              <Text>{i + 1}</Text>
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
};
const NewTab = () => {
  const dispatch = useDispatch();

  const min = useSelector((state) => state.maps.min);
  const max = useSelector((state) => state.maps.max);
  const size = useSelector((state) => state.maps.current.size);
  const selectedType = useSelector((state) => state.maps.selectedType);
  const iterationCount = useSelector((state) => state.maps.iterationCount);
  const selectedIterationIndex = useSelector((state) => state.maps.selectedIterationIndex);
  const complexity = useSelector((state) => state.maps.complexity);
  const complexityRank = useSelector((state) => state.maps.complexityRank);

  return (
    <Box padding={10}>
      <FormField label="Size">
        <TextInput type="number" min={min} max={max}
          value={`${size}`}
          onChange={(event) => {
            event.stopPropagation();
            dispatch({ type: "maps/current/size", payload: event.target.value });
          }} />
      </FormField>
      <FormFieldDivider />
      <FormField label="Tile Type">
        <ButtonGroup mode="radio" aria-label="Tile Type"
          checked={selectedType} onChange={(event) => dispatch({ type: "maps/selectedType", payload: event.target.getAttribute("data-index") })}>
          <Button>Start</Button>
          <Button>End</Button>
          <Button>Path</Button>
          <Button>Food</Button>
        </ButtonGroup>
      </FormField>
      <FormFieldDivider />
      <FormField label="Iterations">
        <Fragment>
          <TextInput type="number" min={0}
            value={`${iterationCount}`}
            onChange={(event) => {
              event.stopPropagation();
              dispatch({ type: "maps/iterationCount", payload: event.target.value });
            }} />
          <Flex padding={5} gutterWidth={0} wrap justifyContent="around">
           {Array.from(
              Array(iterationCount),
              (_, i) => (
                <FlexItem key={i} margin={5}>
                  <Button
                    disabled={i === selectedIterationIndex} onClick={() => dispatch({ type: "maps/selectedIterationIndex", payload: i })}
                    >{i + 1}</Button>
                </FlexItem>
              )
            )}
          </Flex>
        </Fragment>
      </FormField>
      <FormField label="Complexity (rank)">
        <Text>{complexity} ({complexityRank})</Text>
      </FormField>
    </Box>
  );
};
const ImportTab = () => (
  <TextArea onChange={(event) => {
    event.stopPropagation();
    console.log(event.target.value);
  }}></TextArea>
);
const ExportTab = () => {
  const json = useSelector((state) => state.maps.json);

  return (
    <Text>{json}</Text>
  );
};

export default () => {
  const dispatch = useDispatch();

  const mapIndex = useSelector((state) => state.maps.selectedIndex);

  return (
    <Tabs position="start" label="Maps"
      selectedTabIndex={mapIndex}
      onChange={(index) => dispatch({ type: "maps/selectedIndex", payload: index })}>
      <Tab title="Existing"><ExistingTab /></Tab>
      <Tab title="New"><NewTab /></Tab>
      <Tab title="Import"><ImportTab /></Tab>
      <Tab title="Export"><ExportTab /></Tab>
    </Tabs>
  );
};