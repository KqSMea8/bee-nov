package models

import (
	"fmt"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// MChapter    contains information for an chapter info.
	MChapter struct {
		ID         string   `bson:"id"`
		Title      string   `bson:"title"`
		Paragraphs []string `bson:"paragraphs"`
		Readcount  int      `bson:"readcount"`
		Recommend  int      `bson:"recommend"`
		Price      int      `bson:"price"`
		Index      int      `bson:"index"`
	}
)

// FindByTitle query a document according to input Title.
func (cpt *MChapter) FindByTitle(title string) (code int, err error) {
	mConn := Conn()

	bc := mConn.DB("web").C("chapter")
	err = bc.Find(bson.M{"title": title}).One(cpt)

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
func (cpt *MChapter) FindByID(idd string) (code int, err error) {
	mConn := Conn()

	bc := mConn.DB("web").C("chapter")
	err = bc.Find(bson.M{"id": idd}).One(cpt)

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

// FindByBook query a document according to input id.
func FindByBook(bkName string) (*[]MChapter, error) {
	mConn := Conn()
	bc := mConn.DB("web").C("chapter")

	var cptList = make([]MChapter, 0)
	err := bc.Find(bson.M{"name": bkName}).All(&cptList)
	for x, y := range cptList {
		fmt.Println(x, y)
	}
	if err != nil {
		if err == mgo.ErrNotFound {
			//code = ErrNotFound
		} else {
			//code = ErrDatabase
		}
	} else {
		//code = 0
		fmt.Println("")
	}
	return &cptList, err
}
