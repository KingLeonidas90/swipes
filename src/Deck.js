import React, { Component } from 'react';
import {
   View,
   Animated,
   PanResponder,
   Dimensions
 } from 'react-native';

// Mithilfe dieser Komponenten kann man die Screengröße ermitteln
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  // Wenn die Komponente erstellt wird, wird geprüft ob alle Props die übergeben werden
  // vorhanden sind, wenn nicht, werden sie automatisch die Props verwendet, die
  // in defaultProps angegeben werden
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }
  //standard Konstruktor
  // Diesen verwenden wir in diesem Fall, um beim Erzeugen der Deck Komponenten
  // automatisch eine Instanz des PanResponders zu erzeugen
  constructor(props) {
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      // Diese Funktion wird immer ausgeführt, wenn ein Benutzer den Screen berührt
      // Wenn man als Rückgabe return true verwendet, wird der komplette Responder
      // automatisch dafür verantwortlich, dass wenn immer ein Benutzer den Screen berührt
      // dieser Responder angesprochen wird
      // Gibt man false ein, wird der Responder nicht angesprochen
      onStartShouldSetPanResponder: () => true,
      // Diese Funktion wird immer angesprochen, wenn der Benutzer den Screen
      //verschieben möchte (dragen)
      // event beeinhaltet ein objekt, das informationen darüber beinhaltet
      // welches Element aktuell gedrückt worden ist
      // gesture als Argument gibt auskunft darüber, wo der Benutzer gerade drückt
      // und kennt die genaue Pixelangabe der gedrückten Stelle
      // ausserdem wie schnell der Benutzer drückt bzw langfährt
      onPanResponderMove: (event, gesture) => {
        // wir bestimmen anstelle der spring Methode wie in Ball.js nun die Position
        // manuell.. dx und dy geben uns die Position an
       position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      // Diese Funktion wird immer angesprochen, wenn der Benutzer den Screen wieder
      //loslässt, n*****************achdem er ihn verschieben wollte)
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index: 0 };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }


  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      // die Reihenfolge der Werte der inputRange entsprechen der Reihenfolge der
      // Werte der outputRange
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg, 0, 120deg']
    });

    return {
      ...position.getLayout(),

      transform: [{ rotate }]
    };
  }

  forceSwipe(direction) {
    // Wenn das Argument, welches wir übergeben === 'right' ist, wird der erste festgelegte
    // Wert genommen, ansonsten der 2te nach dem :
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      // duration nimmt immer millisekunden
      duration: SWIPE_OUT_DURATION
      // Durch diese callback Funktion wird sichergestellt,  dass die nächste Funktion erst dann
      // ausgeführt wird, wenn die Animation vorbei ist ( nach den 250 millisekunden)
    }).start(() => this.swipeComplete(direction));
  }

  swipeComplete(direction) {
    const { onSwipeRight, onSwipeLeft, data } = this.props;
    // damit gehen wir in unsere Liste von Daten und erhalte den Eintrag, den wir gerade Swipen
    const item = data[this.state.index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

// Um alle Karten zu rendern wird über den kompletten Datensatz gemappt, den wir über die
// props aus dem Deck in App.js holen. anschließend wird für jedes Item eine einzelne Karte
// gerendert und dessen Text ausgegeben mithilfe der renderCard Funktion
  renderCards() {
    // Bevor wir in die map schleife gehen, können wir prüfen ob das die letzte Karte war
    // und dann eine Funktion die diesen Fall behandelt ausführen
    if (this.state.index >= this.props.data.length) {
      return this.props.noMoreRenderCards();
    }
    // der zweite Parameter index zeigt auf die aktuelle stelle des Arrays, welches erzeugt wird
    // WICHTIG! Immer wenn eine liste durch map erzeugt wird, muss das Top Root Element
    // welches die Liste verwendet einen Key zugewiesen bekommen
    return this.props.data.map((item, i) => {
      if (i < this.state.index) {
         return null;
      }
      if (i === this.state.index) {
        return (
          <Animated.View
            key={item.id}
            // Wenn man mehrere Styles gleichzeitig hinzufügen möchte, dann alles im Array
            style={[this.getCardStyle(), styles.cardStyle]}
           {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
        >
        {this.props.renderCard(item)}
      </Animated.View>
      );
    }).reverse();
  }

  render() {
    return (
      // Um den panResponder mit der View zu verknüpfen greifen wir auf den state zu
      // das ... sorgt dafür, dass wir alle props die der panHandlers besitzt nehmen
      // und an die View übergeben, bzw Zugriff darauf schaffen
      <View>
        {this.props.renderCards()}
      </View>
    );
  }
}

const styles = {
  // Durch position absolute schrumpfen die Elemente auf ihr Minimum
  // meistens genau so lang, wie der text ist
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

export default Deck;

// Stephens Version
// import React, { Component } from 'react';
// import {
//   View,
//   Animated,
//   PanResponder,
//   Dimensions,
//   LayoutAnimation,
//   UIManager
// } from 'react-native';
//
// const SCREEN_WIDTH = Dimensions.get('window').width;
// const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
// const SWIPE_OUT_DURATION = 250;
//
// class Deck extends Component {
//   static defaultProps = {
//     onSwipeRight: () => {},
//     onSwipeLeft: () => {}
//   }
//
//   constructor(props) {
//     super(props);
//
//     const position = new Animated.ValueXY();
//     const panResponder = PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (event, gesture) => {
//         position.setValue({ x: gesture.dx, y: gesture.dy });
//       },
//       onPanResponderRelease: (event, gesture) => {
//         if (gesture.dx > SWIPE_THRESHOLD) {
//           this.forceSwipe('right');
//         } else if (gesture.dx < -SWIPE_THRESHOLD) {
//           this.forceSwipe('left');
//         } else {
//           this.resetPosition();
//         }
//       }
//     });
//
//     this.state = { panResponder, position, index: 0 };
//   }
//
//   componentWillReceiveProps(nextProps) {
//     if (nextProps.data !== this.props.data) {
//       this.setState({ index: 0 });
//     }
//   }
//
//   componentWillUpdate() {
//     UIManager.setLayoutAnimationEnabledExperimental &&
// UIManager.setLayoutAnimationEnabledExperimental(true);
//     LayoutAnimation.spring();
//   }
//
//   forceSwipe(direction) {
//     const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
//     Animated.timing(this.state.position, {
//       toValue: { x, y: 0 },
//       duration: SWIPE_OUT_DURATION
//     }).start(() => this.onSwipeComplete(direction));
//   }
//
//   onSwipeComplete(direction) {
//     const { onSwipeLeft, onSwipeRight, data } = this.props;
//     const item = data[this.state.index];
//
//     direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
//     this.state.position.setValue({ x: 0, y: 0 });
//     this.setState({ index: this.state.index + 1 });
//   }
//
//   resetPosition() {
//     Animated.spring(this.state.position, {
//       toValue: { x: 0, y: 0 }
//     }).start();
//   }
//
//   getCardStyle() {
//     const { position } = this.state;
//     const rotate = position.x.interpolate({
//       inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
//       outputRange: ['-120deg', '0deg', '120deg']
//     });
//
//     return {
//       ...position.getLayout(),
//       transform: [{ rotate }]
//     };
//   }
//
//   renderCards() {
//     if (this.state.index >= this.props.data.length) {
//       return this.props.renderNoMoreCards();
//     }
//
//     return this.props.data.map((item, i) => {
//       if (i < this.state.index) { return null; }
//
//       if (i === this.state.index) {
//         return (
//           <Animated.View
//             key={item.id}
//             style={[this.getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
//             {...this.state.panResponder.panHandlers}
//           >
//             {this.props.renderCard(item)}
//           </Animated.View>
//         );
//       }
//
//       return (
//         <Animated.View
//           key={item.id}
//           style={[styles.cardStyle, { top: 10 * (i - this.state.index), zIndex: 5 }]}
//         >
//           {this.props.renderCard(item)}
//         </Animated.View>
//       );
//     }).reverse();
//   }
//
//   render() {
//     return (
//       <View>
//         {this.renderCards()}
//       </View>
//     );
//   }
// }
//
// const styles = {
//   cardStyle: {
//     position: 'absolute',
//     width: SCREEN_WIDTH
//   }
// };
//
// export default Deck;
