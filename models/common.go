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

// Category ...
var Category = map[string]string{"玄幻": "/xuanhuan", "武侠": "/wuxia", "全本": "/quanben", "校园": "/xiaoyuan"}

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
