package controllers

import (
	"bee-nov/models"

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
	c.TplName = "bkone.html"

	bk := models.MBook{}
	if code, err := bk.FindByName("首辅养成手册"); err != nil {
		beego.Error("FindRoleById:", err)
		if code == models.ErrNotFound {
			c.RetError(errNoUser)
		} else {
			c.RetError(errDatabase)
		}
		return
	}

	c.Data["name"] = bk.Author
	beego.Debug("RoleInfo:", &bk)

}
