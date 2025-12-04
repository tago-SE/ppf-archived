# Code Blocks

## Example languages

=== "C"

    ``` c title="main.c"
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

=== "C++"

    ``` c++ title="hello.cpp"
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```

=== "C#"

    ``` csharp title="Program.cs"
    using System;

    class Program {
        static void Main() {
            Console.WriteLine("Hello, world!");
        }
    }
    ```

=== "Python"

    ``` py title="hello.py"
    print "Hello"
    ```

=== "Go"

    ``` go title="hello.go"
    package main

    import "fmt"

    func main() {
        fmt.Println("Hello, world!")
    }
    ```

=== "JavaScript"
    ``` javascript title="hello.js"
    console.log("Hello, world!");
    ```

## With line numbers

``` py linenums="1"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```

## Highlight lines

=== "Line"
    ``` py hl_lines="2 3"
    def bubble_sort(items):
        for i in range(len(items)):
            for j in range(len(items) - 1 - i):
                if items[j] > items[j + 1]:
                    items[j], items[j + 1] = items[j + 1], items[j]
    ```
=== "Line ranges"
    ``` py hl_lines="3-5"
    def bubble_sort(items):
        for i in range(len(items)):
            for j in range(len(items) - 1 - i):
                if items[j] > items[j + 1]:
                    items[j], items[j + 1] = items[j + 1], items[j]
    ```

## Highlighting inline code blocks

The `#!python range()` function is used to generate a sequence of numbers.

## References

[MKDocs - Code blocks](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/)
