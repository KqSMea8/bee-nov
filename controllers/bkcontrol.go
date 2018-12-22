package controllers

import (
	"bee-nov/models"
	"crypto/md5"
	"fmt"
	"strconv"

	"github.com/astaxie/beego"
)

/*BookController ...***/
type BookController struct {
	BaseController
}

/*Get ... ***/
func (c *BookController) Get() {
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"
	c.Data["CategoryList"] = models.CategoryList
	bid := c.Ctx.Input.Param(":id")
	fmt.Print(bid)

	bk := models.MBook{}
	if code, err := bk.FindByName("刀剑攻略"); err != nil {
		//	if code, err := bk.FindByID(bid); err != nil {
		beego.Error("FindRoleById:", err)
		if code == models.ErrNotFound {
			c.RetError(errNoUser)
		} else {
			c.RetError(errDatabase)
		}
		return
	}

	if chapters, err := models.MLoadChapter("刀剑攻略", 0, 30); err == nil {
		for cii, coo := range *chapters {
			has := md5.Sum([]byte(coo.Urlc))
			md5str := fmt.Sprintf("%x", has)
			(*chapters)[cii].ID = strconv.Itoa(coo.Index) + "_" + md5str
			fmt.Println("--------", coo.Index)
			bk.Chapters = append(bk.Chapters, (*chapters)[cii])
		}
		//copy(bk.Chapters, *chapters)
	} else {
		fmt.Println("select book error")
	}

	c.Data["tBook"] = bk
	c.TplName = "bkone.html"
}

/*LoadMore ... ***/
func (c *BookController) LoadMore() {
	fmt.Println("loadmore")
	result := map[string]interface{}{
		"success": false,
	}

	if bklist, err := models.FindByCount(6); err == nil {
		result["length"] = 6
		result["totalPage"] = 122
		result["BkList"] = bklist
		c.Data["json"] = &result
		c.ServeJSON()
	} else {
		fmt.Println("LoadMore book error")
	}
}

/*CategoryPage ... ***/
func (c *BookController) CategoryPage() {
	fmt.Println("CategoryPage")
	result := map[string]interface{}{
		"success": false,
	}

	if bklist, err := models.FindByCount(6); err == nil {
		result["length"] = 6
		result["totalPage"] = 122
		result["BkList"] = bklist
		c.Data["json"] = &result
		c.ServeJSON()
	} else {
		fmt.Println("LoadMore book error")
	}
}
