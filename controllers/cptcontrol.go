package controllers

import (
	"bee-nov/models"
	"fmt"

	"github.com/astaxie/beego"
)

/*ChapterController ...***/
type ChapterController struct {
	BaseController
}

/*Get ... ***/
func (c *ChapterController) Get() {
	c.Data["Website"] = "beego.me"
	c.Data["Email"] = "astaxie@gmail.com"
	c.Data["CategoryList"] = models.CategoryList
	cid := c.Ctx.Input.Param(":id")

	fmt.Println(cid)
	cpt := models.MChapter{}
	if code, err := cpt.FindByID(cid); err != nil {
		beego.Error("FindByID:", err)
		if code == models.ErrNotFound {
			c.RetError(errNoUser)
		} else {
			c.RetError(errDatabase)
		}
		c.Abort("404")
	} else {
		c.Data["tChapter"] = cpt
	}

	c.TplName = "cptone.html"

}
