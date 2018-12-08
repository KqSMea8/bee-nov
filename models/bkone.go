package models

import (
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// MBook contains information for an book info.
	MBook struct {
		Name   string `bson:"name"`
		Author string `bson:"author"`
		ID     string `bson:"id"`
	}

	// BuoyLocation contains the buoys location.
	BuoyLocation struct {
		Type        string    `bson:"type" json:"type"`
		Coordinates []float64 `bson:"coordinates" json:"coordinates"`
	}

	// BuoyStation contains information for an individual station.
	BuoyStation struct {
		ID        bson.ObjectId `bson:"_id,omitempty"`
		StationID string        `bson:"station_id" json:"station_id"`
		Name      string        `bson:"name" json:"name"`
		LocDesc   string        `bson:"location_desc" json:"location_desc"`
		Location  BuoyLocation  `bson:"location" json:"location"`
	}
)

// FindByName query a document according to input id.
func (bk *MBook) FindByName(name string) (code int, err error) {
	mConn := Conn()
	defer mConn.Close()

	bc := mConn.DB("web").C("book")
	err = bc.Find(bson.M{"name": name}).One(bk)

	if err != nil {
		if err == mgo.ErrNotFound {
			code = ErrNotFound
		} else {
			code = ErrDatabase
		}
	} else {
		code = 0
	}
	return
}
