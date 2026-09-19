<template>
	<div class="home-container layout-pd">
		<el-row :gutter="15" class="home-card-two mb15">
			<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
				<div class="home-card-item">
					<div style="height: 100%" ref="homeLineRef"></div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="homePieRef"></div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="15" class="home-card-three">
			<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="home-media">
				<div class="home-card-item">
					<div style="height: 100%" ref="homeradarRef"></div>
				</div>
			</el-col>
			<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
				<div class="home-card-item">
					<div class="home-card-item-title">实时手势识别记录</div>
					<div class="home-monitor">
						<div class="flex-warp">
							<el-table :data="state.paginatedData" style="width: 100%" height="360" v-loading="state.loading">
								<el-table-column prop="username" label="操作用户" align="center" width="120" />
								<el-table-column prop="label" label="识别结果" align="center" width="120">
									<template #default="scope">
										<el-tag 
											:type="getResultType(scope.row.label)"
											effect="light"
										>
											{{ formatLabel(scope.row.label) }}
										</el-tag>
									</template>
								</el-table-column>
								<el-table-column prop="confidence" label="置信度" align="center" width="120">
									<template #default="scope">
										{{ formatConfidence(scope.row.confidence) }}
									</template>
								</el-table-column>
								<el-table-column prop="weight" label="模型权重" align="center" width="120" />
								<el-table-column prop="conf" label="识别阈值" align="center" width="120" />
								<el-table-column prop="startTime" label="识别时间" align="center" width="180" />
								<el-table-column label="操作" align="center" width="100">
									<template #default="scope">
										<el-button link type="primary" size="small" @click="handleViewDetail(scope.row)">
											详情
										</el-button>
									</template>
								</el-table-column>
							</el-table>
							<div class="pagination-container">
								<el-pagination
									v-model:current-page="state.currentPage"
									v-model:page-size="state.pageSize"
									:page-sizes="[10, 20, 50, 100]"
									:small="true"
									:layout="layout"
									:total="state.total"
									@size-change="handleSizeChange"
									@current-change="handleCurrentChange"
								/>
							</div>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>

		<!-- 详情弹窗 -->
		<el-dialog
			v-model="state.detailDialogVisible"
			:title="`手势识别记录详情 - ${state.selectedRecord?.username || ''}`"
			width="80%"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			center
		>
			<div class="detail-container" v-loading="state.detailLoading">
				<el-row :gutter="20">
					<!-- 手势图片 -->
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<div class="detail-section">
							<h3 class="detail-title">原始图片</h3>
							<div class="image-container">
								<div class="img-wrapper" @click="previewImage(getImageUrl(state.selectedRecord?.inputImg), '原始图片')">
									<img 
										:src="getImageUrl(state.selectedRecord?.inputImg)" 
										alt="原始图片" 
										class="detection-image"
										v-if="state.selectedRecord?.inputImg"
									/>
									<div class="img-overlay" v-if="state.selectedRecord?.inputImg">
										<el-icon><View /></el-icon>
									</div>
									<div v-else class="image-placeholder">
										<el-icon><Picture /></el-icon>
										<span>暂无原始图片</span>
									</div>
								</div>
							</div>
						</div>
					</el-col>
					
					<!-- 识别信息 -->
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<div class="detail-section">
							<h3 class="detail-title">识别信息</h3>
							<el-descriptions :column="1" border>
								<el-descriptions-item label="操作用户">
									{{ state.selectedRecord?.username || '未知' }}
								</el-descriptions-item>
								
								<el-descriptions-item label="识别结果">
									<el-tag 
										:type="getResultType(state.selectedRecord?.label || '')"
										effect="light"
									>
										{{ formatLabel(state.selectedRecord?.label || '') }}
									</el-tag>
								</el-descriptions-item>
								
								<el-descriptions-item label="置信度">
									{{ formatConfidence(state.selectedRecord?.confidence || '') }}
								</el-descriptions-item>
								
								<el-descriptions-item label="模型权重">
									{{ state.selectedRecord?.weight || '未知' }}
								</el-descriptions-item>
								
								<el-descriptions-item label="识别阈值">
									{{ state.selectedRecord?.conf || '未知' }}
								</el-descriptions-item>
								
								<el-descriptions-item label="识别时间">
									{{ state.selectedRecord?.startTime || '未知' }}
								</el-descriptions-item>
								
								<el-descriptions-item label="手势分析详情" v-if="hasDetectionDetails">
									<div class="detection-details">
										<div 
											v-for="(item, index) in getDetectionDetails()" 
											:key="index"
											class="detail-item"
										>
											<span class="detail-label">{{ item.label }}:</span>
											<span class="detail-value">{{ item.confidence }}</span>
										</div>
									</div>
								</el-descriptions-item>
							</el-descriptions>
						</div>
					</el-col>
				</el-row>
				
				<!-- 原图与识别结果对比 -->
				<el-row :gutter="20" v-if="state.selectedRecord?.inputImg || state.selectedRecord?.outImg">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<div class="detail-section">
							<h3 class="detail-title">原始图片</h3>
							<div class="image-container">
								<div class="img-wrapper" @click="previewImage(getImageUrl(state.selectedRecord.inputImg), '原始图片')">
									<img 
										:src="getImageUrl(state.selectedRecord.inputImg)" 
										alt="原始图片" 
										class="detection-image"
										v-if="state.selectedRecord?.inputImg"
									/>
									<div class="img-overlay" v-if="state.selectedRecord?.inputImg">
										<el-icon><View /></el-icon>
									</div>
									<div v-else class="image-placeholder">
										<el-icon><Picture /></el-icon>
										<span>暂无原始图片</span>
									</div>
								</div>
							</div>
						</div>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
						<div class="detail-section">
							<h3 class="detail-title">标注图片</h3>
							<div class="image-container">
								<div class="img-wrapper" @click="previewImage(getImageUrl(state.selectedRecord.outImg), '标注图片')">
									<img 
										:src="getImageUrl(state.selectedRecord.outImg)" 
										alt="标注图片" 
										class="detection-image"
										v-if="state.selectedRecord?.outImg"
									/>
									<div class="img-overlay" v-if="state.selectedRecord?.outImg">
										<el-icon><View /></el-icon>
									</div>
									<div v-else class="image-placeholder">
										<el-icon><Picture /></el-icon>
										<span>暂无标注图片</span>
									</div>
								</div>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="state.detailDialogVisible = false">关闭</el-button>
					<el-button type="primary" @click="handleDownloadImage" :disabled="!state.selectedRecord?.inputImg">
						<el-icon><Download /></el-icon>
						下载识别图片
					</el-button>
				</span>
			</template>
		</el-dialog>

		<!-- 图片预览弹窗 -->
		<el-dialog 
			v-model="state.previewDialog.visible" 
			:title="state.previewDialog.title" 
			width="60%"
			align-center
			class="image-preview-dialog">
			<div class="preview-content">
				<img :src="state.previewDialog.imageUrl" :alt="state.previewDialog.title" class="preview-image" />
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="home">
import { reactive, onMounted, ref, watch, nextTick, onActivated, markRaw, computed } from 'vue';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture, Download, View } from '@element-plus/icons-vue';
import request from '/@/utils/request';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';

// 定义变量内容
const homeLineRef = ref();
const homePieRef = ref();
const homeradarRef = ref();
const storesTagsViewRoutes = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);

// 手势字母定义
const GESTURE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// 手势颜色映射 - 使用不同颜色区分字母
const GESTURE_COLORS: Record<string, string> = {
  'A': '#ff4d4f', 'B': '#fa8c16', 'C': '#fadb14', 'D': '#52c41a', 'E': '#13c2c2',
  'F': '#1890ff', 'G': '#722ed1', 'H': '#eb2f96', 'I': '#fa541c', 'J': '#a0d911',
  'K': '#1890ff', 'L': '#13c2c2', 'M': '#52c41a', 'N': '#faad14', 'O': '#fadb14',
  'P': '#fa8c16', 'Q': '#fa541c', 'R': '#eb2f96', 'S': '#722ed1', 'T': '#2f54eb',
  'U': '#1d39c4', 'V': '#10239e', 'W': '#061178', 'X': '#030852', 'Y': '#91d5ff',
  'Z': '#adc6ff'
};

const state = reactive({
	data: [] as any,
	paginatedData: [] as any,
	loading: false,
	currentPage: 1,
	pageSize: 10,
	total: 0,
	global: {
		homeChartOne: null,
		homeChartTwo: null,
		homeCharFour: null,
		dispose: [null, '', undefined],
	} as any,
	myCharts: [] as any[],
	charts: {
		theme: '',
		bgColor: '',
		color: '#e2e8f0',
	},
	// 详情弹窗相关
	detailDialogVisible: false,
	detailLoading: false,
	selectedRecord: null as any,
	// 图片预览弹窗
	previewDialog: {
		visible: false,
		title: '',
		imageUrl: '',
	},
});

// 响应式分页数据
const layout = computed(() => {
	return window.innerWidth < 768 ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper';
});

const getImageUrl = (imagePath: string) => resolveFileUrl(imagePath);

// 是否有检测详情
const hasDetectionDetails = computed(() => {
	if (!state.selectedRecord) return false;
	try {
		const labels = JSON.parse(state.selectedRecord.label || '[]');
		const confidences = JSON.parse(state.selectedRecord.confidence || '[]');
		return labels.length > 0 && confidences.length > 0;
	} catch {
		return false;
	}
});

// 获取检测详情
const getDetectionDetails = () => {
	if (!state.selectedRecord) return [];
	try {
		const labels = JSON.parse(state.selectedRecord.label || '[]');
		const confidences = JSON.parse(state.selectedRecord.confidence || '[]');
		
		return labels
			.map((label: string, index: number) => {
				// 如果是索引，转换为字母
				const letterIndex = parseInt(label);
				const gestureLabel = letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length 
					? GESTURE_LETTERS[letterIndex] 
					: `${label}`;
				
				return {
					label: `手势 ${gestureLabel}`,
					confidence: confidences[index] ? `${(parseFloat(confidences[index]) * 100).toFixed(1)}%` : '0%',
					color: GESTURE_COLORS[gestureLabel] || '#1890ff'
				};
			})
			.filter((item: any, index: number) => labels[index] !== undefined);
	} catch {
		return [];
	}
};

// 图片预览
const previewImage = (imageUrl: string, title: string) => {
	if (!imageUrl) {
		ElMessage.warning('没有可预览的图片');
		return;
	}
	state.previewDialog.imageUrl = imageUrl;
	state.previewDialog.title = title;
	state.previewDialog.visible = true;
};

// 分页处理
const handleSizeChange = (val: number) => {
	state.pageSize = val;
	state.currentPage = 1;
	updatePaginatedData();
};

const handleCurrentChange = (val: number) => {
	state.currentPage = val;
	updatePaginatedData();
};

const updatePaginatedData = () => {
	const start = (state.currentPage - 1) * state.pageSize;
	const end = start + state.pageSize;
	state.paginatedData = state.data.slice(start, end);
};

// 格式化标签显示 - 手势识别逻辑
const formatLabel = (label: string) => {
	try {
		const labels = JSON.parse(label);
		if (labels.length > 0) {
			const firstLabel = labels[0];
			const letterIndex = parseInt(firstLabel);
			if (letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length) {
				return `手势 ${GESTURE_LETTERS[letterIndex]}`;
			}
			return `手势 ${firstLabel}`;
		}
		return '未识别到手势';
	} catch {
		if (label && label.length > 0 && label !== '[]' && label !== '""') {
			// 尝试直接转换
			const letterIndex = parseInt(label);
			if (!isNaN(letterIndex) && letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length) {
				return `手势 ${GESTURE_LETTERS[letterIndex]}`;
			}
			return `手势 ${label}`;
		}
		return '未识别到手势';
	}
};

// 根据识别结果设置标签类型 - 手势识别逻辑
const getResultType = (label: string) => {
	try {
		const labels = JSON.parse(label);
		if (labels.length > 0) {
			const letterIndex = parseInt(labels[0]);
			if (letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length) {
				// 根据字母索引设置不同的tag样式
				const letter = GESTURE_LETTERS[letterIndex];
				// A-M 使用 success，N-Z 使用 primary
				const letterCode = letter.charCodeAt(0);
				if (letterCode >= 65 && letterCode <= 77) return 'success';
				if (letterCode >= 78 && letterCode <= 90) return 'primary';
			}
			return 'info';
		}
		return 'info';
	} catch {
		if (label && label.length > 0 && label !== '[]' && label !== '""') {
			return 'primary';
		}
		return 'info';
	}
};

// 格式化置信度显示
const formatConfidence = (confidence: string) => {
	try {
		const confidences = JSON.parse(confidence);
		if (confidences.length === 0) return '0%';
		
		const maxConfidence = Math.max(...confidences.map((conf: any) => {
			if (typeof conf === 'number') return conf * 100;
			if (typeof conf === 'string') {
				const num = parseFloat(conf.replace('%', ''));
				return isNaN(num) ? 0 : num;
			}
			return 0;
		}));
		return `${maxConfidence.toFixed(1)}%`;
	} catch {
		if (typeof confidence === 'number') {
			return `${(confidence * 100).toFixed(1)}%`;
		}
		return confidence || '0%';
	}
};

// 查看详情
const handleViewDetail = async (row: any) => {
	state.selectedRecord = row;
	state.detailDialogVisible = true;
	state.detailLoading = true;
	
	try {
		const res = await request.get(`/api/imgRecords/${row.id}`);
		if (res.code === '200') {
			const record = res.data;
			state.selectedRecord = {
				...record,
				inputImg: record.inputImg || record.imagePath,
				outImg: record.outImg || record.resultImagePath
			};
		}
	} catch (error) {
		console.error('获取详情失败:', error);
		state.selectedRecord = row;
	} finally {
		state.detailLoading = false;
	}
};

// 下载图片
const handleDownloadImage = async () => {
	if (!state.selectedRecord?.inputImg) {
		ElMessage.warning('没有可下载的图片');
		return;
	}
	
	try {
		const imageUrl = getImageUrl(state.selectedRecord.inputImg);
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		
		const filename = state.selectedRecord.inputImg.split('/').pop() || 
			`gesture_detection_${state.selectedRecord.username}_${state.selectedRecord.startTime?.replace(/[: ]/g, '-') || 'unknown'}.jpg`;
		
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
		
		ElMessage.success('图片下载成功');
	} catch (error) {
		console.error('下载图片失败:', error);
		ElMessage.error('图片下载失败');
	}
};

// 折线图 - 近十日识别数量
const initLineChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeChartOne)) state.global.homeChartOne?.dispose();
	state.global.homeChartOne = markRaw(echarts.init(homeLineRef.value, state.charts.theme));
	
	// 统计每天的识别数量
	const counts: Record<string, number> = {};
	state.data.forEach((detection: any) => {
		if (detection.startTime) {
			const date = detection.startTime.split(' ')[0];
			counts[date] = (counts[date] || 0) + 1;
		}
	});

	const sortedDatesDesc = Object.keys(counts).sort((a, b) => b.localeCompare(a));
	const latestDatesDesc = sortedDatesDesc.slice(0, 10);
	const latestDates = latestDatesDesc.sort((a, b) => a.localeCompare(b));

	const result = {
		dateData: latestDates,
		valueData: latestDates.map(date => counts[date])
	};

	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '近十日手势识别数量趋势',
			x: 'left',
			textStyle: { fontSize: 15, color: state.charts.color },
		},
		grid: { top: 70, right: 20, bottom: 30, left: 30 },
		tooltip: { 
			trigger: 'axis',
			formatter: (params: any) => {
				const data = params[0];
				return `${data.name}<br/>手势识别数量: ${data.value}`;
			}
		},
		xAxis: {
			data: result.dateData,
			axisLabel: {
				color: state.charts.color,
				rotate: 45
			},
		},
		yAxis: [
			{
				type: 'value',
				name: '识别数量',
				splitLine: { show: true, lineStyle: { type: 'dashed', color: state.charts.theme === 'dark' ? '#444' : '#f5f5f5' } },
				axisLabel: {
					color: state.charts.color,
				},
			},
		],
		series: [
			{
				name: '手势识别数量',
				type: 'line',
				symbolSize: 6,
				symbol: 'circle',
				smooth: true,
				data: result.valueData,
				lineStyle: { color: '#1890ff' }, // 使用蓝色表示手势识别
				itemStyle: { color: '#1890ff', borderColor: '#1890ff' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#1890ffb3' },
						{ offset: 1, color: '#1890ff03' },
					]),
				},
			},
		],
	};

	state.global.homeChartOne.setOption(option);
	state.myCharts.push(state.global.homeChartOne);
};

// 饼图 - 手势类型分布（按字母）
const initPieChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeChartTwo)) state.global.homeChartTwo?.dispose();
	state.global.homeChartTwo = markRaw(echarts.init(homePieRef.value, state.charts.theme));
	
	const gestureCounts: Record<string, number> = {};
	
	state.data.forEach((detection: any) => {
		try {
			const labels = JSON.parse(detection.label || '[]');
			if (labels.length > 0) {
				const letterIndex = parseInt(labels[0]);
				if (letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length) {
					const gesture = GESTURE_LETTERS[letterIndex];
					gestureCounts[gesture] = (gestureCounts[gesture] || 0) + 1;
				} else if (labels[0] in GESTURE_COLORS) {
					// 如果已经是字母
					gestureCounts[labels[0]] = (gestureCounts[labels[0]] || 0) + 1;
				}
			}
		} catch {
			// 如果解析失败，尝试直接使用
			if (detection.label in GESTURE_COLORS) {
				gestureCounts[detection.label] = (gestureCounts[detection.label] || 0) + 1;
			}
		}
	});

	// 按字母顺序排序
	const sortedGestures = Object.keys(gestureCounts)
		.filter(letter => GESTURE_LETTERS.includes(letter))
		.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

	const pieData = sortedGestures.map(letter => ({
		name: `手势 ${letter}`,
		value: gestureCounts[letter],
		itemStyle: {
			color: GESTURE_COLORS[letter]
		}
	}));

	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '手势类型分布统计',
			x: 'left',
			textStyle: { fontSize: '15', color: state.charts.color },
		},
		legend: {
			top: 'bottom',
			textStyle: {
				color: state.charts.color
			},
			type: 'scroll' // 如果字母太多，可以滚动
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b}: {c}次 ({d}%)'
		},
		series: [
			{
				type: 'pie',
				radius: ['40%', '70%'],
				center: ['50%', '50%'],
				avoidLabelOverlap: true,
				itemStyle: {
					borderRadius: 5,
					borderColor: state.charts.bgColor,
					borderWidth: 2
				},
				label: {
					show: true,
					formatter: '{b}: {c}次',
					color: state.charts.color
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '14',
						fontWeight: 'bold'
					}
				},
				data: pieData
			}
		]
	};

	state.global.homeChartTwo.setOption(option);
	state.myCharts.push(state.global.homeChartTwo);
};

// 雷达图 - 用户置信度分析
const initradarChart = () => {
	if (!state.global.dispose.some((b: any) => b === state.global.homeCharFour)) state.global.homeCharFour?.dispose();
	state.global.homeCharFour = markRaw(echarts.init(homeradarRef.value, state.charts.theme));
	
	const userConfidenceStats: Record<string, { total: number, count: number }> = {};
	
	state.data.forEach((detection: any) => {
		const username = detection.username || '未知用户';
		let avgConfidence = 0;
		
		try {
			const confidences = JSON.parse(detection.confidence || '[]');
			if (confidences.length > 0) {
				const validConfidences = confidences.filter((conf: any) => {
					if (typeof conf === 'number') return true;
					if (typeof conf === 'string') {
						const num = parseFloat(conf.replace('%', ''));
						return !isNaN(num);
					}
					return false;
				});
				
				if (validConfidences.length > 0) {
					const numericConfidences = validConfidences.map((conf: any) => {
						if (typeof conf === 'number') return conf;
						if (typeof conf === 'string') {
							const num = parseFloat(conf.replace('%', '')) / 100;
							return isNaN(num) ? 0 : num;
						}
						return 0;
					});
					
					avgConfidence = numericConfidences.reduce((sum: number, conf: number) => sum + conf, 0) / numericConfidences.length;
				}
			}
		} catch {
			if (typeof detection.confidence === 'number') {
				avgConfidence = detection.confidence;
			} else if (typeof detection.confidence === 'string') {
				const num = parseFloat(detection.confidence.replace('%', '')) / 100;
				avgConfidence = isNaN(num) ? 0 : num;
			}
		}
		
		if (!userConfidenceStats[username]) {
			userConfidenceStats[username] = { total: avgConfidence, count: 1 };
		} else {
			userConfidenceStats[username].total += avgConfidence;
			userConfidenceStats[username].count += 1;
		}
	});

	const userAvgConfidences = Object.keys(userConfidenceStats).map(username => ({
		username,
		avgConf: userConfidenceStats[username].total / userConfidenceStats[username].count,
		count: userConfidenceStats[username].count
	}));

	const topUsers = userAvgConfidences
		.filter(user => user.count >= 3)
		.sort((a, b) => b.avgConf - a.avgConf)
		.slice(0, 7);

	if (topUsers.length === 0) {
		const option = {
			backgroundColor: state.charts.bgColor,
			title: {
				text: '用户识别置信度分析',
				x: 'left',
				textStyle: { fontSize: '15', color: state.charts.color },
			},
			graphic: {
				type: 'text',
				left: 'center',
				top: 'center',
				style: {
					text: '数据不足，无法生成置信度分析',
					fontSize: 14,
					fill: state.charts.color
				}
			}
		};
		state.global.homeCharFour.setOption(option);
		state.myCharts.push(state.global.homeCharFour);
		return;
	}

	const data = topUsers.map(user => Number((user.avgConf * 100).toFixed(2)));
	const indicatorNames = topUsers.map(user => user.username);

	const indicator = indicatorNames.map((name) => ({ 
		name, 
		max: 100 
	}));

	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '用户识别置信度分析',
			x: 'left',
			textStyle: { fontSize: '15', color: state.charts.color },
		},
		tooltip: {
			formatter: (params: any) => {
				const userIndex = indicatorNames.findIndex(name => name === params.name);
				const user = topUsers[userIndex];
				return `${params.name}<br/>平均置信度: ${params.value}%<br/>识别次数: ${user?.count || 0}次`;
			}
		},
		radar: {
			radius: '65%',
			splitNumber: 4,
			indicator: indicator,
			axisName: {
				color: state.charts.color,
				fontSize: 12
			},
			splitArea: {
				areaStyle: {
					color: ['rgba(24,144,255,0.1)', 'rgba(24,144,255,0.05)'],
				}
			},
			splitLine: {
				lineStyle: {
					color: 'rgba(24,144,255,0.3)'
				}
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(24,144,255,0.5)'
				}
			}
		},
		series: [{
			type: 'radar',
			data: [{
				value: data,
				name: '平均置信度',
				areaStyle: {
					color: 'rgba(24,144,255,0.3)'
				},
				lineStyle: {
					color: '#1890ff'
				},
				itemStyle: {
					color: '#1890ff'
				},
				label: {
					show: true,
					formatter: (params: any) => {
						return params.value + '%';
					}
				}
			}]
		}]
	};

	state.global.homeCharFour.setOption(option);
	state.myCharts.push(state.global.homeCharFour);
};

// 批量设置 echarts resize
const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			setTimeout(() => {
				state.myCharts[i]?.resize();
			}, i * 1000);
		}
	});
};

const initEchartsResize = () => {
	window.addEventListener('resize', initEchartsResizeFun);
};

// 加载数据
const loadData = async () => {
	state.loading = true;
	try {
		const res = await request.get('/api/imgRecords/all');
		if (res.code === '200') {
			state.data = res.data.map((record: any, index: number) => {
				const transformedRecord = {
					id: record.id,
					num: index + 1,
					inputImg: record.inputImg || record.imagePath,
					outImg: record.outImg || record.resultImagePath,
					weight: record.weight,
					conf: record.conf,
					ai: record.ai,
					suggestion: record.suggestion,
					startTime: record.startTime,
					username: record.username,
					label: record.label,
					confidence: record.confidence,
					family: record.family || []
				};
				
				if (!transformedRecord.family || transformedRecord.family.length === 0) {
					try {
						const labels = JSON.parse(record.label || '[]');
						const confidences = JSON.parse(record.confidence || '[]');
						transformedRecord.family = labels.map((label: string, idx: number) => {
							const letterIndex = parseInt(label);
							const gestureLabel = letterIndex >= 0 && letterIndex < GESTURE_LETTERS.length 
								? GESTURE_LETTERS[letterIndex] 
								: `${label}`;
							
							return {
								label: `手势 ${gestureLabel}`,
								confidence: confidences[idx] || 0,
								color: GESTURE_COLORS[gestureLabel] || '#1890ff',
								startTime: record.startTime
							};
						});
					} catch (error) {
						console.error('构建family字段失败:', error);
						transformedRecord.family = [];
					}
				}
				
				return transformedRecord;
			}).reverse();
			
			state.total = state.data.length;
			updatePaginatedData();
			
			setTimeout(() => {
				initLineChart();
				initradarChart();
				initPieChart();
			}, 100);
		} else {
			ElMessage.error(res.msg || '加载数据失败');
		}
	} catch (error) {
		console.error('加载数据失败:', error);
		ElMessage.error('加载数据失败，请检查网络连接');
	} finally {
		state.loading = false;
	}
};

// 页面加载时
onMounted(() => {
	loadData();
	initEchartsResize();
});

// 由于页面缓存原因，keep-alive
onActivated(() => {
	initEchartsResizeFun();
});

// 监听相关状态变化
watch(
	() => isTagsViewCurrenFull.value,
	() => {
		initEchartsResizeFun();
	}
);

watch(
	() => themeConfig.value.isIsDark,
	(isIsDark) => {
		nextTick(() => {
			state.charts.theme = isIsDark ? 'dark' : '';
			state.charts.bgColor = isIsDark ? 'transparent' : '';
			state.charts.color = '#e2e8f0';
			setTimeout(() => {
				initLineChart();
				initradarChart();
				initPieChart();
			}, 500);
		});
	},
	{
		deep: true,
		immediate: true,
	}
);
</script>

<style scoped lang="scss">
.home-container {
	overflow: hidden;
	padding: 16px;
	box-sizing: border-box;
	background: transparent;

	.home-card-one,
	.home-card-two,
	.home-card-three {
		.home-card-item {
			width: 100%;
			height: 400px;
			border-radius: 18px;
			transition: all 0.25s ease;
			padding: 20px;
			overflow: hidden;
			position: relative;
			isolation: isolate;
			background:
				radial-gradient(circle at 20% 18%, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0) 40%),
				radial-gradient(circle at 84% 84%, rgba(129, 140, 248, 0.18) 0%, rgba(129, 140, 248, 0) 46%),
				linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.88) 56%, rgba(51, 65, 85, 0.88) 100%);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			color: #e2e8f0;
			border: 1px solid rgba(148, 163, 184, 0.3);
			box-shadow: 0 8px 24px rgba(2, 6, 23, 0.2);

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.14'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
				background-size: 180px 180px;
				mix-blend-mode: soft-light;
				opacity: 0.38;
				pointer-events: none;
				z-index: 0;
			}
			
			> * {
				position: relative;
				z-index: 1;
			}
			
			&:hover {
				transform: translateY(-3px);
				box-shadow: 0 12px 30px rgba(2, 6, 23, 0.28);
			}
			
			&-title {
				font-size: 16px;
				font-weight: 700;
				height: 32px;
				margin-bottom: 15px;
				color: #f8fafc;
				border-bottom: 1px solid rgba(148, 163, 184, 0.3);
				padding-bottom: 10px;
				display: flex;
				align-items: center;
				letter-spacing: 0.8px;
			}

			.home-monitor {
				:deep(.el-table) {
					--el-table-bg-color: transparent;
					--el-table-tr-bg-color: transparent;
					--el-table-header-bg-color: rgba(148, 163, 184, 0.12);
					--el-table-border-color: rgba(148, 163, 184, 0.25);
					color: #e2e8f0;
				}

				:deep(.el-table th.el-table__cell) {
					color: #f8fafc;
					font-weight: 700;
				}

				:deep(.el-table td.el-table__cell) {
					color: rgba(226, 232, 240, 0.95);
				}

				:deep(.el-table__inner-wrapper::before) {
					background-color: rgba(148, 163, 184, 0.25);
				}

				:deep(.el-tag) {
					font-weight: 600;
				}

				:deep(.el-button.is-link) {
					color: #7dd3fc;
				}

				:deep(.el-button.is-link:hover) {
					color: #bae6fd;
				}

				:deep(.el-pagination) {
					color: #e2e8f0;
				}

				:deep(.el-pagination .btn-prev),
				:deep(.el-pagination .btn-next),
				:deep(.el-pagination .el-pager li) {
					background: rgba(15, 23, 42, 0.55);
					color: #e2e8f0;
				}

				:deep(.el-pagination .el-pager li.is-active) {
					color: #7dd3fc;
					font-weight: 700;
				}
			}
		}
	}
}

/* 详情弹窗样式 */
.detail-container {
	padding: 10px 0;
}

.detail-section {
	margin-bottom: 20px;
}

.detail-title {
	font-size: 16px;
	font-weight: bold;
	margin-bottom: 15px;
	color: #ffffff;
	border-left: 4px solid #00d4ff;
	padding-left: 10px;
}

.image-container {
	width: 100%;
	height: 300px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid rgba(0, 212, 255, 0.35);
	border-radius: 8px;
	overflow: hidden;
	background: radial-gradient(circle at center, rgba(0, 212, 255, 0.08), transparent 70%);
	margin-bottom: 10px;
}

.img-wrapper {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	border-radius: 6px;
	overflow: hidden;
	height: 100%;
	width: 100%;
	
	&:hover {
		.img-overlay {
			opacity: 1;
		}
		
		.detection-image {
			transform: scale(1.05);
		}
	}
	
	.detection-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 4px;
		border: 1px solid var(--next-border-color-light);
		transition: transform 0.3s ease;
	}
	
	.img-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		
		.el-icon {
			color: white;
			font-size: 24px;
		}
	}
}

.image-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--el-text-color-secondary);
	
	.el-icon {
		font-size: 48px;
		margin-bottom: 10px;
	}
}

.detection-details {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.detail-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 4px 0;
}

.detail-label {
	font-weight: 500;
	color: var(--el-text-color-primary);
}

.detail-value {
	color: var(--el-text-color-regular);
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

// 图片预览弹窗样式
.image-preview-dialog {
	.preview-content {
		display: flex;
		justify-content: center;
		align-items: center;
		
		.preview-image {
			max-width: 100%;
			max-height: 70vh;
			object-fit: contain;
			border-radius: 8px;
		}
	}
}

/* 响应式调整 */
@media (max-width: 768px) {
	.home-media {
		margin-top: 15px;
	}
	
	.pagination-container {
		justify-content: center;
	}
	
	.image-container {
		height: 250px;
	}
	
	.detail-section {
		margin-bottom: 15px;
	}
}
</style>