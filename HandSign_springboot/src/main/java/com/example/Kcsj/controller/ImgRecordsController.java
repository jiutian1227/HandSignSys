package com.example.Kcsj.controller;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.Kcsj.common.Result;
import com.example.Kcsj.entity.ImgRecords;
import com.example.Kcsj.mapper.ImgRecordsMapper;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/imgRecords")
public class ImgRecordsController {
    @Resource
    ImgRecordsMapper imgRecordsMapper;

    @GetMapping("/all")
    public Result<?> GetAll(
            @RequestParam String role,          // 前端传递的角色（admin/user），必填
            @RequestParam(required = false) String username  // user角色时必填，admin可选
    ) {
        // 1. 校验角色参数不能为空
        if (StrUtil.isBlank(role)) {
            return Result.error("400", "角色参数role不能为空");
        }

        LambdaQueryWrapper<ImgRecords> wrapper = Wrappers.lambdaQuery();
        // 2. 角色判断：user角色只查自己的记录，admin查全部
        if ("user".equalsIgnoreCase(role)) {
            // user角色必须传username
            if (StrUtil.isBlank(username)) {
                return Result.error("400", "普通用户查询时必须传递username参数");
            }
            wrapper.eq(ImgRecords::getUsername, username);
        } else if (!"admin".equalsIgnoreCase(role)) {
            // 角色参数不合法
            return Result.error("400", "角色参数不合法");
        }

        return Result.success(imgRecordsMapper.selectList(wrapper));
    }


    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable int id) {
        System.out.println(id);
        return Result.success(imgRecordsMapper.selectById(id));
    }

    @GetMapping
    public Result<?> findPage(@RequestParam(defaultValue = "1") Integer pageNum,
                              @RequestParam(defaultValue = "10") Integer pageSize,
                              @RequestParam(defaultValue = "") String search,
                              @RequestParam(defaultValue = "") String search1,
                              @RequestParam(defaultValue = "") String search3,
                              @RequestParam(defaultValue = "") String search2) {
        LambdaQueryWrapper<ImgRecords> wrapper = Wrappers.<ImgRecords>lambdaQuery();
        wrapper.orderByDesc(ImgRecords::getStartTime);
        if (StrUtil.isNotBlank(search)) {
            wrapper.like(ImgRecords::getUsername, search);
        }
        if (StrUtil.isNotBlank(search1)) {
            wrapper.like(ImgRecords::getStartTime, search1);
        }
        if (StrUtil.isNotBlank(search2)) {
            wrapper.like(ImgRecords::getLabel, search2);
        }
        if (StrUtil.isNotBlank(search3)) {
            wrapper.like(ImgRecords::getConf, search3);
        }
        Page<ImgRecords> Page = imgRecordsMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        return Result.success(Page);
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable int id) {
        imgRecordsMapper.deleteById(id);
        return Result.success();
    }

    @PostMapping("/update")
    public Result<?> updates(@RequestBody ImgRecords imgrecords) {
        imgRecordsMapper.updateById(imgrecords);
        return Result.success();
    }


    @PostMapping
    public Result<?> save(@RequestBody ImgRecords imgrecords) {
        System.out.println(imgrecords);
        imgRecordsMapper.insert(imgrecords);
        return Result.success();
    }
}
