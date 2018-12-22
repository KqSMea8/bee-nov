package controllers

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"
)

/*StFileController ...***/
type StFileController struct {
	BaseController
}

func GetCurrentDirectory() string {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0])) //返回绝对路径  filepath.Dir(os.Args[0])去除最后一个元素的路径
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir)
	return strings.Replace(dir, "\\", "/", -1) //将\替换成/
}

/*Get ... ***/
func (c *StFileController) Get() {
	fmt.Println(GetCurrentDirectory())
	curDir := GetCurrentDirectory()
	sss := c.Ctx.Input.Params()
	var outStr string
	if strpa, ok := sss[":splat"]; ok == true {
		palist := strings.Split(strpa[1:], ",")
		for ipa, opa := range palist {
			fmt.Println(ipa, opa)
			filName := curDir + opa
			if _, err := os.Stat(filName); os.IsNotExist(err) {
				fmt.Println("file not exit: ", filName)
				continue
			}
			if dat, err := ioutil.ReadFile(filName); err == nil {
				outStr += string(dat)
				outStr += "\n"
			}
		}
	}
	c.Ctx.Output.Header("Content-Type", "text/css; charset=utf-8")
	c.Ctx.WriteString(outStr)
}
