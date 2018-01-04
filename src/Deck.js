import React, { Component } from 'react';
import {
   View,
   Animated,
   PanResponder
 } from 'react-native';

class Deck extends Component {
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
      onPanResponderRelease: () => {}

    });

    this.state = { panResponder, position };
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-500, 0, 500],
      outputRange: ['-120deg, 0, 120deg']
    });

    return {
      ...position.getLayout(),

      transform: [{ rotate }]
    };
  }

// Um alle Karten zu rendern wird über den kompletten Datensatz gemappt, den wir über die
// props aus dem Deck in App.js holen. anschließend wird für jedes Item eine einzelne Karte
// gerendert und dessen Text ausgegeben mithilfe der renderCard Funktion
  renderCards() {
    // der zweite Parameter index zeigt auf die aktuelle stelle des Arrays, welches erzeugt wird
    // WICHTIG! Immer wenn eine liste durch map erzeugt wird, muss das Top Root Element
    // welches die Liste verwendet einen Key zugewiesen bekommen
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={item.id}
            style={this.getCardStyle()}
           {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }

      return this.props.renderCard(item);
    });
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

export default Deck;
