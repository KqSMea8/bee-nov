package models

import (
	"fmt"
	"math/rand"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// MBook contains information for an book info.
	MBook struct {
		Name    string `bson:"name"`
		Author  string `bson:"author"`
		ID      string `bson:"id"`
		Profile string `bson:"profile"`
		Image   string `bson:"image"`
		Types   string `bson:"type"`
		Numbers int    `bson:"numbers"`
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

// FindByID query a document according to input id.
func (bk *MBook) FindByID(idd string) (code int, err error) {
	mConn := Conn()
	defer mConn.Close()

	bc := mConn.DB("web").C("book")
	err = bc.Find(bson.M{"id": idd}).One(bk)

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

// FindByCount query a document according to input id.
func FindByCount(cnt int) (*[]MBook, error) {
	mConn := Conn()
	defer mConn.Close()

	bc := mConn.DB("web").C("book")
	var bookList = make([]MBook, 0)
	err := bc.Find(bson.M{"image": bson.M{"$ne": ""}}).Skip(rand.Intn(100)).Limit(cnt).All(&bookList)
	if err != nil {
		if err == mgo.ErrNotFound {
			fmt.Println("bkone not found")
			//code = ErrNotFound
		} else {
			fmt.Println("bkone db error")
			//code = ErrDatabase
		}
	} else {
		//code = 0
	}
	return &bookList, err
}
