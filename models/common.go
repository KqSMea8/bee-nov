package models

import (
	"fmt"

	mgo "gopkg.in/mgo.v2"
)

// Predefined model error codes.
const (
	ErrDatabase = -1
	ErrSystem   = -2
	ErrDupRows  = -3
	ErrNotFound = -4
)

type (
	// Category contains information for an Category info.
	Category struct {
		Name    string `bson:"name"`
		ID      string `bson:"id"`
		Profile string `bson:"profile"`
		Image   string `bson:"image"`
		Urll    string `bson:"url"`
		Numbers int    `bson:"numbers"`
	}
)

// CategoryList ...
var CategoryList = []Category{
	{Name: "玄1", ID: "/xuanhuan", Profile: "Profile1", Image: "a.jpg", Urll: "/xuanhuan", Numbers: 5555},
	{Name: "玄2", ID: "/wuxia", Profile: "Profile2", Image: "a.jpg", Urll: "/wuxia", Numbers: 111},
	{Name: "玄3", ID: "/quanben", Profile: "Profile3", Image: "a.jpg", Urll: "/quanben", Numbers: 123},
	{Name: "玄4", ID: "/xiaoyuan", Profile: "Profile4", Image: "a.jpg", Urll: "/xiaoyuan", Numbers: 122222}}

// CodeInfo definiton.
type CodeInfo struct {
	Code int
	Info string
}

// NewErrorInfo return a CodeInfo represents error.
func NewErrorInfo(info string) *CodeInfo {
	return &CodeInfo{-1, info}
}

// NewNormalInfo return a CodeInfo represents OK.
func NewNormalInfo(info string) *CodeInfo {
	return &CodeInfo{0, info}
}

var session *mgo.Session

// Conn return mongodb session.
func Conn() *mgo.Session {
	return session.Copy()
}

/*
func Close() {
	session.Close()
}
*/

func init() {
	//url := beego.AppConfig.String("mongodb::127.0.0.1,27017")
	sess, err := mgo.Dial("127.0.0.1,27017")
	if err != nil {
		fmt.Println("mdb connect err")
		//panic(err)
		return
	}
	fmt.Println("db con")

	session = sess
	session.SetMode(mgo.Monotonic, true)
}
