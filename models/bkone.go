package models

import (
	"fmt"
	"math/rand"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type (
	// MChpater contains information for an chapter info.
	MChpater struct {
		Title      string   `bson:"title"`
		Index      int      `bson:"index"`
		Urlc       string   `bson:"url"`
		ID         string   // `bson:"id"`
		Intime     string   `bson:"intime"`
		Recommend  int      `bson:"recommend"`
		Readcount  int      `bson:"readcount"`
		Numbers    int      // `bson:"numbers"`
		Paragraphs []string `bson:"paragraphs"`
	}

	// MBook contains information for an book info.
	MBook struct {
		Name     string     `bson:"name"`
		Author   string     `bson:"author"`
		ID       string     `bson:"id"`
		Profile  string     `bson:"profile"`
		Image    string     `bson:"image"`
		Types    string     `bson:"type"`
		Numbers  int        `bson:"numbers"`
		Chapters []MChpater `bson:"chapters,omitempty"`
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
	err = bc.Find(bson.M{"name": name}).Select(bson.M{"chapters": 0}).One(bk)

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
			fmt.Println("FindByCount not found")
			//code = ErrNotFound
		} else {
			fmt.Println("FindByCount db error")
			//code = ErrDatabase
		}
	} else {
		//code = 0
	}
	return &bookList, err
}

// FirstByCount query a document according to input id.
func FirstByCount(cnt int) (*[]MBook, error) {
	mConn := Conn()
	defer mConn.Close()

	bc := mConn.DB("web").C("book")
	var bookList = make([]MBook, 0)
	err := bc.Find(bson.M{"image": bson.M{"$ne": ""}}).Skip(0).Limit(cnt).All(&bookList)
	if err != nil {
		if err == mgo.ErrNotFound {
			fmt.Println("FirstByCount not found")
			//code = ErrNotFound
		} else {
			fmt.Println("FirstByCount db error")
			//code = ErrDatabase
		}
	} else {
		//code = 0
	}
	return &bookList, err
}

// MLoadChapter query a document according to input id.
func MLoadChapter(idd string, indexC int, cnt int) (*[]MChpater, error) {
	mConn := Conn()
	defer mConn.Close()

	bc := mConn.DB("web").C("book")
	pipeLine := []bson.M{
		{"$match": bson.M{"name": idd}},
		{"$project": bson.M{"_id": 0,
			"chapters": bson.M{"$slice": []interface{}{"$chapters", indexC, cnt}}}}}
	var bk MBook
	err := bc.Pipe(pipeLine).One(&bk)
	if err != nil {
		return nil, err
	}

	var chpaterList = make([]MChpater, len(bk.Chapters))
	copy(chpaterList, bk.Chapters)

	/*var result struct {
		Id        string `bson:"_id"`
		State     string `bson:"st"`
		City      string `bson:"city"`
		Address   string `bson:"address"`
		NoteCount int    `bson:"notecount"`
	}
	for iter.Next(&result) {
		log.Printf("%+v", result)
	}
	if iter.Err() != nil {
		log.Println(iter.Err())
	}*/

	//err := bc.Find(bson.M{"name": idd}).Select(bson.M{"chapters": 1}).Skip(indexC).Limit(cnt).All(&chpaterList)
	if false {
		if true {
			//if err == mgo.ErrNotFound {
			fmt.Println("chapter not found")
			//code = ErrNotFound
		} else {
			fmt.Println("chapter db error")
			//code = ErrDatabase
		}
	} else {
		//code = 0
	}
	return &chpaterList, nil
}
