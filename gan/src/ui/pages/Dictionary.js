import { useStore } from "effector-react";
import React, { useState } from "react";
import styled from "styled-components";

import { currentIteration$ } from "../../store/iterations";
import * as colors from "../colors";
import { Center, Horizontal, HR, Label, Panel, Spacer, Title, VR } from "../components";
import HorizontalPreview from "../HorizontalPreview";

const dictionary = [
  [ "ARTIFICIAL INTELLIGENCE", ": sometimes called machine intelligence, is intelligence demonstrated by machines, unlike the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of \"intelligent agents\": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. The term is often used to describe machines (or computers) that mimic \"cognitive\" functions that humans associate with the human mind, such as \"learning\" and \"problem solving\"." ],
  [ "AVG", ": average - a statistical measurement." ],
  [ "BPM", ": beats per minute (heart rate), the number of heartbeats detected during one minute" ],
  [ "CLASS", ": an example of pattern recognition. In statistics, classification is the problem of identifying to which of a set of categories a new observation belongs, on the basis of a training set of data containing observations (or instances) whose category membership is known. Example is assigning a diagnosis to a given patient based on observed characteristics of the patient (sex, blood pressure, presence or absence of certain symptoms, etc.). Classification is an example of pattern recognition. In the terminology of machine learning, classification is considered an instance of supervised learning, i.e., learning where a training set of correctly identified observations is available. The corresponding unsupervised procedure is known as clustering, and involves grouping data into categories based on some measure of inherent similarity or distance." ],
  [ "CONVOLUTIONAL NEURAL NETWORK", ": in deep learning, a convolutional neural network (CNN, or ConvNet) is a class of deep neural networks, most commonly applied to analysing visual imagery. They have applications in image and video recognition, recommender systems, image classification, medical image analysis, natural language processing, and financial time series." ],
  [ "DATA", ": characteristics or information, usually numerical, that are collected through observation." ],
  [ "DELTA", ": Δ, a difference of state between two before and after state schemas." ],
  [ "DEEP LEARNING", ": part of a broader family of machine learning methods based on artificial neural networks with representation learning. Deep learning architectures such as deep neural networks, deep belief networks, recurrent neural networks and convolutional neural networks have been applied to fields including computer vision, machine vision, speech recognition, natural language processing, audio recognition, social network filtering, machine translation, bioinformatics, drug design, medical image analysis, material inspection and board game programs, where they have produced results comparable to and in some cases surpassing human expert performance." ],
  [ "EPOCH", ": a date and time from which a computer measures system time." ],
  [ "GENERATOR", ": a routine that acts like an iterator." ],
  [ "HIDDEN LAYER", ": the layer or layers of neurons between the input layer and the output layer in a neural network." ],
  [ "ITERATION", ": the repetition of a process in order to generate a (possibly unbounded) sequence of outcomes. Each repetition of the process is a single iteration, and the outcome of each iteration is then the starting point of the next iteration. In mathematics and computer science, iteration (along with the related technique of recursion) is a standard element of algorithms." ],
  [ "LAYERS", ": neurons are aggregated into layers. Different layers may perform different transformations on their inputs. Signals travel from the first layer (the input layer), to the last layer (the output layer), possibly after traversing the layers multiple times." ],
  [ "LEARNING", ": the adaptation of the network to better handle a task by considering sample observations." ],
  [ "MACHINE LEARNING", ": the study of computer algorithms that improve automatically through experience.[1][2] It is seen as a subset of artificial intelligence." ],
  [ "NA", ": not available" ],
  [ "NEURAL NETWORKS", ": computing systems based on a collection of connected units or nodes called artificial neurons, which loosely model the neurons in a biological brain. Each connection, like the synapses in a biological brain, can transmit a signal to other neurons. An artificial neuron that receives a signal then processes it and can signal neurons connected to it. The \"signal\" at a connection is a real number, and the output of each neuron is computed by some non-linear function of the sum of its inputs." ],
  [ "TEMP", ": temperature (in !brute_force case measuring skin temperature not body temperature)" ],
  [ "TRAINING", ": Neural networks are trained to learn by processing examples, each of which contains a known \"input\" and \"result\", forming probability-weighted associations between the two, which are stored within the data structure of the network itself. The training of a neural network from a given example is usually conducted by determining the difference between the processed output of the network (often a prediction) and a target output. This is the error. The network then adjusts its weighted associations according to a learning rule and using this error value. Successive adjustments will cause the neural network to produce output which is increasingly similar to the target output." ],
  [ "TRANING DATA", ": machine learning algorithms build a mathematical model based on sample data, known as \"training data\", in order to make predictions or decisions without being explicitly programmed to do so. Machine learning algorithms are used in a wide variety of applications, especially where it is difficult or infeasible to develop conventional algorithms to perform the needed tasks." ],
  [ "TRAINING MODEL", ": the model is initially fit on a training dataset, which is a set of examples used to fit the parameters (e.g. weights of connections between neurons in artificial neural networks) of the model." ],
];

const Container = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: 100%;
  grid-gap: 17px;
  grid-template-columns: 1fr;
  height: 639px;
`;

export const Link = styled.button`
  background-color: ${colors.array[0]};
  color: ${colors.array[3]};
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 4px;
  padding: 10px;
  text-transform: uppercase;

  &.active {
    color: ${colors.array[6]};
  }
`;

export default () => {
  const [ selectedIndex, setSelectedIndex ] = useState(0);

  const iteration = useStore(currentIteration$);
  
  if(iteration === null) {
    return (
      <Container>
        <Panel>
          <Center>loading dictionary</Center>
        </Panel>
      </Container>
    );
  }

  return (
    <Container>
      <Panel>
        <Title>map example</Title>
        <HR />
        <div style={{
          backgroundColor: colors.array[4],
          padding: 17,
        }}>
          <HorizontalPreview layout={iteration.combined} />
          <Horizontal>
            <Spacer />
            <Label style={{ color: colors.array[8], fontSize: 15, paddingTop: 17 }}>walkable moving plate</Label>
            <Label style={{ color: colors.array[7], fontSize: 15, paddingLeft: 34, paddingTop: 17 }}>nonwalkable empty space</Label>
          </Horizontal>
        </div>
        <HR />
        <Title>terminology</Title>
        <HR />
        <div style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            overflowY: "auto",
            padding: 22,
          }}>
          {dictionary.map(([ title ], i) => (
            <div key={i} style={{ margin: "auto", textAlign: "center" }}><Link key={i} className={selectedIndex === i ? "active" : ""} onClick={() => setSelectedIndex(i)}>{title}</Link></div>
          ))}
          </div>
          <VR />
          <div style={{
            display: "flex",
            color: colors.array[5],
            flex: 1,
            fontSize: 20,
            overflowY: "auto",
            padding: 22,
          }}>
            <div style={{ letterSpacing: "2px", margin: "auto" }}>{dictionary[selectedIndex][1]}</div>
          </div>
        </div>
      </Panel>
    </Container>
  );
};
