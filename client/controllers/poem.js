angular.module('poetry-jam').controller('PoemCtrl', function($scope, $rootScope, $stateParams, $meteor) {
	$scope.$meteorSubscribe('Poem', $stateParams.poemId);
	$scope.poem = $scope.$meteorObject(Poems, $stateParams.poemId);

	$scope.$meteorSubscribe('Lines', $stateParams.poemId);
	$scope.lines = $scope.$meteorCollection(Lines);

	$scope.isPoemOwner = function() {
		if (!$rootScope.currentUser) {
			return false;
		}
		if (!$scope.poem) {
			return false;
		}
		return $scope.poem.ownerId === $rootScope.currentUser._id;
	};

	$scope.finalizePoem = function() {
		Poems.update($stateParams.poemId, {
			$set: {
				'isFinalized': true
			}
		});
	};

	$scope.addNewLine = function() {
		var line = {};
		line.type = 'text';
		line.text = '';
		line.suggestions = [];
		line.isFinalized = false;
		line.ownerId = $rootScope.currentUser._id;
		line.poemId = $stateParams.poemId;
		line.createdAt = Date.now();
		line._id = Lines.insert(line);
	};

	$scope.addNewBreak = function() {
		var line = {};
		line.type = 'break';
		line.ownerId = $rootScope.currentUser._id;
		line.poemId = $stateParams.poemId;
		line.createdAt = Date.now();
		line._id = Lines.insert(line);
	};

	$scope.addSuggestion = function(line) {
		var text = line.$newSuggestionText;
		if (_.isEmpty(text)) {
			return;
		}

		$meteor.call('AddLineSuggestion', line._id, text).then(function() {
			line.$newSuggestionText = '';
		});
	};

	$scope.chooseSuggestion = function(line, suggestion) {
		Lines.update(line._id, {
			$set: {
				'text': suggestion.text,
				'isFinalized': true
			}
		});
	};
});
