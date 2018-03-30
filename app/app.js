import React, { Component } from 'react';
import { Text, View, Dimensions, Modal } from 'react-native';
import { Button } from 'native-base';
import Grid from './components/grid';
import style from './style/style';

import AppConfig from './config/appConfig';
import Data from './config/data';
var SortedList = require('sortedlist');

const { width, height } = Dimensions.get("window");
const cellSize = (Math.min(width, height) - 35) / 5;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortedValues: [],
      values: [],
      score: 0,
      bestScore: AppConfig.bestScore,
      backgroundColor: 'white',
      timer: 15,
      endModalVisible: false
    }

    this._updateTime = this._updateTime.bind(this);
    this._onItemTapped = this._onItemTapped.bind(this);
    this._closeEndGameModal = this._closeEndGameModal.bind(this);
    this._replay = this._replay.bind(this);
  }

  componentWillMount() {
    this._initializeList();
  }

  _initializeList() {
    var sortedList = SortedList.create();
    var list = [];

    while (sortedList.length < 16) {
      var val = Math.round(Math.random() * 100) + 1;
      if (sortedList.key(val) == null) {
        sortedList.insert(val);
        list.push({
          key: list.length,
          val: val
        });
      }
    }

    this.state.backgroundColor = Data.backgroundColors[(this.state.score % 160) / 10];
    this.setState({ sortedValues: sortedList, values: list });
    this.forceUpdate();
    this.state.timer = 15;
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(this._updateTime, 1000);
  }

  _updateTime() {
    this.state.timer--;
    this.forceUpdate();
    if (this.state.timer == 0) {
      clearInterval(this.timerInterval);
      this.setState({ endModalVisible: true });
    }
  }

  async _onItemTapped(item) {
    if (item.val == this.state.sortedValues[0]) {
      this.state.time += 2;
      this.state.score++;

      if (this.state.score > this.state.bestScore) {
        await AppConfig.updateBestScore(this.state.score);
        this.setState({ bestScore: this.state.score });

        var sortedList = this.state.sortedValues;
        var list = this.state.values;
        this.setState({ sortedValues: [], values: [] });

        if (this.state.score % 10 == 0) {
          this._initializeList();
          return;
        }

        var newVal = Math.round(Math.random() * 100) + 1;
        while (sortedList.key(newVal) == null) {
          var newVal = Math.round(Math.random() * 100) + 1;
        }

        sortedList.remove(0);

        list.splice(item.key, 1, { key: item.key, val: newVal });
        sortedList.insert(newVal);
        this.setState({ sortedValues: sortedList, values: list });
        this.forceUpdate();
      }
    } else {
      this.setState({ endModalVisible: true });
    }
  }

  _closeEndGameModal() {
    this.setState({ endModalVisible: false });
  }

  _replay() {
    this.state.score = 0;
    this._closeEndGameModal();
    this._initializeList();
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.state.backgroundColor }}>

        <View style={[style.topView, { height: cellSize }]}>
          <View style={style.indexRowView}>
            <Text style={[style.indexVerticalText, { fontSize: cellSize * 0.6 }]}>{this.state.score}</Text>
          </View>
          <View style={style.indexRowView}>
            <Text style={[style.indexVerticalText, { fontSize: cellSize * 0.6 }]}>{this.state.timer >= 60 ? this.state.timer / 60 : ''}{':'}{this.state.timer % 60}</Text>
          </View>
          <View style={style.indexSimpleView}>
            <Text style={[style.indexText, { fontSize: cellSize * 0.2 }]}>BEST SCORE</Text>
            <Text style={[style.indexText, { fontSize: cellSize * 0.4 }]}>{this.state.bestScore}</Text>
          </View>
        </View>
        <Grid
          values={this.state.values}
          cellSize={cellSize}
          _onItemTapped={this._onItemTapped}
        />
        <Modal
          visible={this.state.endModalVisible}
          animationType={'fade'}
          transparent={true}
          onRequestClose={this._closeEndGameModal}
        >
          <View style={[style.modalAlignment, { backgroundColor: this.state.backgroundColor, width: width, height: height }]}>
            <Button onPress={this._replay} style={[style.replayButton, { height: cellSize * 0.6 }]}>
              <Text style={[style.replayText, { fontSize: cellSize * 0.4 }]}>REPLAY</Text>
            </Button>
          </View>
        </Modal>

      </View >
    );
  }
}
