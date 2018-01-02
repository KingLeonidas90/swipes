 import React, { Component } from 'react';
 import { View, Animated } from 'react-native';

 class Ball extends Component {

   componentWillMount() {
     // ValueXY legt den Start Wert fest. wir beginnen bei 0,0
     // Aktuelle Position des animierten Objekts
     this.position = new Animated.ValueXY(0, 0);

     // Spring ändert die aktuelle Position des Objekts
     Animated.spring(this.position, {
       toValue: { x: 200, y: 500 }
     }).start();
   }
   render() {
     return (
       // Animated.View spezifiziert die Objekte die wir animieren wollen
       // Diese nimmt keine Props entgegen. Stattdessen legt man über den style fest
       // was genau wie animiert werden soll.
       <Animated.View style={this.position.getLayout()}>
         <View style={styles.ball} />
       </Animated.View>
     );
   }
 }
const styles = {
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 30,
    borderColor: 'black'
  }
};

export default Ball;
